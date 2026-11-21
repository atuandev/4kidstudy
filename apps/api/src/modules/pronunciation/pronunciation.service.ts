import { Injectable, Logger } from '@nestjs/common';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';
import { PronunciationAssessmentResponseDto } from './dto/res/pronunciation';

@Injectable()
export class PronunciationService {
  private readonly logger = new Logger(PronunciationService.name);

  constructor() {
    ffmpeg.setFfmpegPath(ffmpegPath);
    this.logger.log(`FFmpeg path set to: ${ffmpegPath}`);
  }

  private async convertAudioToWav(audioBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const readableStream = new Readable();
      readableStream.push(audioBuffer);
      readableStream.push(null);

      ffmpeg(readableStream)
        .toFormat('wav')
        .audioFrequency(16000)
        .audioChannels(1)
        .audioBitrate('256k')
        .on('error', (err: Error) => {
          this.logger.error(`FFmpeg conversion error: ${err.message}`);
          reject(new Error(`Audio conversion failed: ${err.message}`));
        })
        .on('end', () => {
          this.logger.log('Audio to WAV conversion completed');
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }

  async assess(
    audioBuffer: Buffer,
    referenceText: string,
  ): Promise<PronunciationAssessmentResponseDto> {
    try {
      this.logger.log('Converting audio to WAV format...');
      const wavBuffer = await this.convertAudioToWav(audioBuffer);

      const speechKey = process.env.AZURE_SPEECH_KEY;
      const speechRegion = process.env.AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        throw new Error('Azure Speech credentials are not configured');
      }

      const speechConfig = sdk.SpeechConfig.fromSubscription(
        speechKey,
        speechRegion,
      );

      const pushStream = sdk.AudioInputStream.createPushStream();

      const arrayBuffer = wavBuffer.buffer.slice(
        wavBuffer.byteOffset,
        wavBuffer.byteOffset + wavBuffer.byteLength,
      ) as ArrayBuffer;

      pushStream.write(arrayBuffer);
      pushStream.close();

      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true,
      );

      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationConfig.applyTo(recognizer);

      return new Promise<PronunciationAssessmentResponseDto>(
        (resolve, reject) => {
          recognizer.recognizeOnceAsync(
            (result: sdk.SpeechRecognitionResult) => {
              if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                const assessment =
                  sdk.PronunciationAssessmentResult.fromResult(result);

                const response: PronunciationAssessmentResponseDto = {
                  success: true,
                  accuracy: assessment.accuracyScore,
                  fluency: assessment.fluencyScore,
                  completeness: assessment.completenessScore,
                  prosody: assessment.prosodyScore,
                  overall: assessment.pronunciationScore,
                  recognizedText: result.text,
                  words: assessment.detailResult?.Words?.map((word) => ({
                    word: word.Word,
                    accuracy: word.PronunciationAssessment?.AccuracyScore ?? 0,
                    errorType: word.PronunciationAssessment?.ErrorType,
                  })),
                  rawResult: JSON.parse(JSON.stringify(assessment)) as Record<
                    string,
                    any
                  >,
                };

                this.logger.log(
                  `Assessment completed for: "${referenceText}" with overall score: ${response.overall}`,
                );
                resolve(response);
              } else {
                this.logger.error(`Recognition failed: ${result.errorDetails}`);
                resolve({
                  success: false,
                  error: `Không thể nhận diện: ${result.errorDetails}`,
                });
              }
              recognizer.close();
            },
            (err: string) => {
              this.logger.error(`SDK error: ${err}`);
              reject(new Error(`Lỗi SDK: ${err}`));
              recognizer.close();
            },
          );
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Assessment error: ${errorMessage}`, errorStack);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

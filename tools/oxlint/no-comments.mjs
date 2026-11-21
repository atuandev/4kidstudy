import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE_FILE = path.join(ROOT, "tools/oxlint/comment-baseline.json");

const EXEMPT = [/(^|\/)src\/generated\//, /^apps\/web\/components\/ui\//];

let budgets;

function loadBudgets() {
  if (budgets) return budgets;
  if (process.env.NO_COMMENTS_INVENTORY) return (budgets = {});
  try {
    budgets = JSON.parse(readFileSync(BASELINE_FILE, "utf8")).files ?? {};
  } catch {
    budgets = {};
  }
  return budgets;
}

function preview(comment) {
  const text = comment.value
    .replace(/^\s*\*+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

const noComments = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow comments. Names, types and tests carry intent; decisions live in docs/adr.",
    },
  },
  create(context) {
    return {
      Program() {
        const file = path.relative(ROOT, context.filename).split(path.sep).join("/");
        if (EXEMPT.some((pattern) => pattern.test(file))) return;
        const comments = context.sourceCode.getAllComments();

        if (process.env.NO_COMMENTS_INVENTORY) {
          for (const comment of comments) {
            context.report({ loc: comment.loc, message: `INVENTORY ${JSON.stringify(comment.range)}` });
          }
          return;
        }

        const budget = loadBudgets()[file] ?? 0;

        if (budget === 0) {
          for (const comment of comments) {
            context.report({
              loc: comment.loc,
              message: `Comment not allowed: "${preview(comment)}". Rename, extract, or record the decision in docs/adr (see /delete-comment).`,
            });
          }
          return;
        }

        if (comments.length > budget) {
          context.report({
            loc: comments[0].loc,
            message: `${comments.length} comments, but the baseline allows ${budget}. Remove the new ones: the comment baseline only goes down.`,
          });
        } else if (comments.length < budget) {
          context.report({
            loc: { line: 1, column: 0 },
            message: `${comments.length} comments, below the baseline of ${budget}. Run \`pnpm comments:baseline\` to lock in the drop.`,
          });
        }
      },
    };
  },
};

export default {
  meta: { name: "no-comments" },
  rules: { "no-comments": noComments },
};

const { NotionToMarkdown } = require('notion-to-md');
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

n2m.setCustomTransformer('paragraph', async (block) => {
  const { paragraph } = block;
  if (!paragraph.rich_text || paragraph.rich_text.length === 0) {
    return '&nbsp;';
  }
  return false;
});

(async () => {
  const mdblocks = [
    { type: 'heading_1', parent: '# Heading 1' },
    { type: 'paragraph', paragraph: { rich_text: [{ plain_text: 'Paragraph 1' }] } },
    { type: 'paragraph', paragraph: { rich_text: [] } },
    { type: 'paragraph', paragraph: { rich_text: [{ plain_text: 'Paragraph 2' }] } }
  ];
  // Wait, I need to pass raw blocks, not mdblocks, to n2m.blocksToMarkdown
  const rawBlocks = [
    { type: 'heading_1', heading_1: { rich_text: [{ plain_text: 'Heading 1' }] } },
    { type: 'paragraph', paragraph: { rich_text: [{ plain_text: 'Paragraph 1' }] } },
    { type: 'paragraph', paragraph: { rich_text: [] } },
    { type: 'paragraph', paragraph: { rich_text: [{ plain_text: 'Paragraph 2' }] } }
  ];
  const processed = await n2m.blocksToMarkdown(rawBlocks);
  const mdString = n2m.toMarkdownString(processed);
  console.log(JSON.stringify(mdString.parent));
})();

const { NotionToMarkdown } = require('notion-to-md');
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  const blocks = await notion.blocks.children.list({ block_id: '380b16703d4f8012b132e7c94d162b31' });
  const mdblocks = await n2m.blocksToMarkdown(blocks.results);
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(JSON.stringify(mdString.parent));
})();

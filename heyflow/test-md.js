const { NotionToMarkdown } = require('notion-to-md');
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  const mdblocks = [
    { type: 'heading_1', parent: '# Heading 1' },
    { type: 'paragraph', parent: 'Paragraph 1' },
    { type: 'paragraph', parent: '' },
    { type: 'paragraph', parent: 'Paragraph 2' }
  ];
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(JSON.stringify(mdString.parent));
})();

module.exports = {
  title: 'xoid',
  tagline: 'Scalable state-management library for React and vanilla',
  organizationName: 'xoid',
  projectName: 'xoid-website',
  url: 'https://xoid.dev',
  baseUrl: '/',
  scripts: [],
  favicon: 'img/logo-mini.svg',
  titleDelimiter: '·',
  onBrokenLinks: 'throw',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          editUrl: 'https://github.com/onurkerimov/xoid/blob/master/website/',
          path: '../docs',
          sidebarPath: require.resolve('./sidebars.json'),
        },
        blog: {
          path: 'blog',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All Blog Posts',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Docusaurus`,
          },
        },
        theme: {
          customCss: [
            require.resolve('./src/css/customTheme.scss'),
            require.resolve('./src/css/index.scss'),
          ],
        },
      },
    ],
  ],
  plugins: ['docusaurus-plugin-sass', './sitePlugin'],
  themeConfig: {
    prism: {
      defaultLanguage: 'jsx',
      theme: require('./core/PrismTheme'),
    },
    navbar: {
      title: 'xoid',
      logo: {
        src: 'img/logo-mini.svg',
        alt: 'xoid',
      },
      style: 'dark',
      items: [
        {
          label: 'Docs',
          type: 'doc',
          docId: 'getting-started',
          position: 'right',
        },
        {
          type: 'doc',
          docId: 'examples',
          label: 'Examples',
          position: 'right',
        },
        // {
        //   to: '/blog',
        //   label: 'Blog',
        //   position: 'right',
        // },
        {
          href: 'https://github.com/onurkerimov/xoid',
          'aria-label': 'GitHub repository',
          position: 'right',
          className: 'navbar-github-link',
        },
      ],
    },
    image: 'img/logo-og.png',
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/getting-started',
            },
            {
              label: 'API',
              to: 'docs/api/create',
            },
            {
              label: 'Recipes',
              to: 'docs/recipes/async',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Examples',
              to: 'docs/examples',
            },
            // {
            //   label: 'Blog',
            //   to: 'blog',
            // },
            {
              label: 'Github',
              to: 'https://github.com/onurkerimov/xoid',
            },
          ],
        },
        // {
        //   title: 'Star on GitHub',
        //   items: [
        //     {
        //       html: `
        //       <a class="github-button" href="https://github.com/onurkerimov/xoid" data-icon="octicon-star" aria-label="Star onurkerimov/xoid on GitHub">Star</a>
        //       `,
        //     },
        //   ]
        // }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Docusaurus. Forked from reactnative.dev`,
    },
    algolia: {
      apiKey: '65b07d8a6194b1b1cf824ac4547482bd',
      indexName: 'xoid',
      contextualSearch: true,
    },
    // googleAnalytics: {
    //   trackingID: 'xxxx',
    // },
    // gtag: {
    //   trackingID: 'xxxx',
    // },
    metadatas: [
      {
        name: 'description',
        content: 'Scalable state-management library for React and vanilla',
      },
      { property: 'og:title', content: 'xoid' },
      {
        property: 'og:description',
        content: 'Scalable state-management library for React and vanilla',
      },
      { property: 'og:url', content: 'https://xoid.dev/' },
      {
        property: 'og:image',
        content: 'https://xoid.dev/img/xoid-black.png',
      },
      { name: 'twitter:card', content: 'summary' },
      {
        name: 'twitter:image',
        content: 'https://xoid.dev/img/xoid-black.png',
      },
    ],
  },
}

const ansibleItems = [
    'ansible/basics',
    'ansible/fact',
    'ansible/inventory',
    'ansible/jinja',
    'ansible/loops',
    'ansible/module',
    'ansible/playbook',
    'ansible/roles',
    'ansible/sensitive-data',
    'ansible/tasks'
]

const dockerItems = [
    'docker/basics',
    'docker/compose',
    'docker/dockerfile',
    'docker/installation'
]

const kubeItems = [
  'kubernetes/basics',
  'kubernetes/kube-objects'
]

const linuxItems = [
  'linux/cron',
  'linux/env',
  'linux/file-system',
  'linux/files',
  'linux/notes',
  'linux/process',
  'linux/rights',
  'linux/search',
  'linux/shell',
  'linux/ssh',
  'linux/streams'
]

const mongoItems = ['mongo/notes']
const pgItems = ['postgres/notes']
const redisItems = ['redis/notes']
const reactItems = ['react/notes']
const svelteItems = ['svelte/notes']
const nextItems = ['next/notes']
const vueItems = ['vue/notes']

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
    /*
  tutorialSidebar: [
      'intro',
    {
      type: 'category',
      label: 'DevOps',
      items: [
        {
          type: 'category',
          label: 'Ansible',
          items: ansibleItems,
        },
        {
          type: 'category',
          label: 'Docker',
          items: dockerItems,
        },
        {
          type: 'category',
          label: 'Kubernetes',
          items: kubeItems,
        },
        {
          type: 'category',
          label: 'Linux',
          items: linuxItems,
        }
      ],
    },
    {
      type: 'category',
      label: 'Front',
      items: [
        {
          type: 'category',
          label: 'React',
          items: reactItems
        },
          {
              type: 'category',
              label: 'Next',
              items: nextItems
          },
          {
              type: 'category',
              label: 'Svelte',
              items: svelteItems
          },
          {
              type: 'category',
              label: 'Vue',
              items: vueItems
          },
      ]
    },
      {
          type: 'category',
          label: 'Databases',
          items: [
              {
                  type: 'category',
                  label: 'Mongo',
                  items: mongoItems
              },
              {
                  type: 'category',
                  label: 'PostgreSQL',
                  items: pgItems
              },
              {
                  type: 'category',
                  label: 'Redis',
                  items: redisItems
              }
          ]
      }
  ],

     */
};

export default sidebars;

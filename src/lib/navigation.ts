export type NavigationItem = {
  label: string
  href: string
  description?: string
  external?: boolean
}

export type NavigationSection = {
  label: string
  items: NavigationItem[]
}

export const githubUrl = 'https://github.com/phtn/beast'

export const navigation: NavigationSection[] = [
  {
    label: 'Get started',
    items: [
      {
        label: 'Overview',
        href: '/docs',
        description: 'What Beast is and where it fits.'
      },
      {
        label: 'Quick start',
        href: '/docs/get-started',
        description: 'Create a Beast application.'
      },
      {
        label: 'How it works',
        href: '/docs/how-it-works',
        description: 'Follow BTSX from source to browser.'
      }
    ]
  },
  {
    label: 'Language',
    items: [
      {
        label: 'Elements & nesting',
        href: '/docs/language',
        description: 'Author structure with indentation.'
      },
      {
        label: 'Components & props',
        href: '/docs/components',
        description: 'Imports, setup, props, and local components.'
      },
      {
        label: 'Control flow',
        href: '/docs/control-flow',
        description: 'Conditions, loops, switches, and boundaries.'
      },
      {
        label: 'Continuation',
        href: '/docs/continuation',
        description: 'Break long lines with ~ without creating children.'
      }
    ]
  },
  {
    label: 'Skills',
    items: [
      {
        label: 'Beast skill',
        href: '/docs/skills',
        description: 'Build, debug, and ship Beast with the agent skill.'
      },
      {
        label: 'React to Beast',
        href: '/docs/react-to-beast',
        description: 'Audit and migrate React applications to Beast.'
      }
    ]
  },
  {
    label: 'Tooling',
    items: [
      {
        label: 'CLI reference',
        href: '/docs/cli',
        description: 'Compile files and build source trees.'
      },
      {
        label: 'Compiler API',
        href: '/docs/compiler-api',
        description: 'Compile and inspect Beast programmatically.'
      },
      {
        label: 'Diagnostics',
        href: '/docs/diagnostics',
        description: 'Stable error codes and source spans.'
      }
    ]
  },
  {
    label: 'Integrations',
    items: [
      {
        label: 'Vite integration',
        href: '/docs/vite',
        description: 'Beast → Octane → Vite'
      },
      {
        label: 'Rspack integration',
        href: '/docs/rspack',
        description: 'Use Beast and Octane with Rspack.'
      },
      {
        label: 'Rsbuild integration',
        href: '/docs/rsbuild',
        description: 'Use Beast and Octane with Rsbuild.'
      },
      {
        label: 'Tailwind integration',
        href: '/docs/tailwind',
        description: 'Use Tailwind utilities with BTSX class shorthand and Vite.'
      }
    ]
  },
  {
    label: 'Examples',
    items: [
      {
        label: 'Basic Examples',
        href: '/docs/examples',
        description: 'Browse BTSX → TSRX goldens.'
      },
      {
        label: 'Compelling Demo',
        href: 'https://compelling.phtn458.workers.dev',
        description: 'Visit Beast compelling demo site.'
      }
    ]
  },
  {
    label: 'Resources',
    items: [
      {
        label: 'Octane coverage',
        href: `${githubUrl}/blob/main/docs/octane-coverage.md`,
        description: 'See supported runtime APIs and roadmap.',
        external: true
      },
      {
        label: 'GitHub repository',
        href: githubUrl,
        description: 'Source, issues, and contributions.',
        external: true
      }
    ]
  }
]

export const searchItems = navigation.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    group: section.label
  }))
)

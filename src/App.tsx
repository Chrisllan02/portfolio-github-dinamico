import { useEffect, useMemo, useState } from 'react'
import './App.css'

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? 'Chrisllan02'
const GITHUB_API = 'https://api.github.com'

type GitHubProfile = {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
}

type GitHubRepo = {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  fork: boolean
  archived: boolean
  language: string | null
  topics?: string[]
  updated_at: string
  pushed_at: string
}

type PortfolioProject = GitHubRepo & {
  displayName: string
  techs: string[]
  score: number
}

const languageColors: Record<string, string> = {
  TypeScript: '#67e8f9',
  JavaScript: '#facc15',
  CSS: '#a78bfa',
  HTML: '#fb7185',
  Python: '#60a5fa',
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function normalizeRepo(repo: GitHubRepo): PortfolioProject {
  const topics = repo.topics ?? []
  const techs = Array.from(new Set([repo.language, ...topics].filter(Boolean))) as string[]
  const hasLiveDemo = Boolean(repo.homepage)
  const score =
    repo.stargazers_count * 8 +
    (hasLiveDemo ? 12 : 0) +
    (repo.description ? 6 : 0) +
    (topics.includes('featured') ? 30 : 0)

  return {
    ...repo,
    displayName: repo.name.replaceAll('-', ' '),
    techs,
    score,
  }
}

function App() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [activeTech, setActiveTech] = useState('Todos')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    async function loadGitHubPortfolio() {
      try {
        const [profileResponse, reposResponse] = await Promise.all([
          fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`),
          fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`),
        ])

        if (!profileResponse.ok || !reposResponse.ok) {
          throw new Error('GitHub API unavailable')
        }

        const profileData = (await profileResponse.json()) as GitHubProfile
        const reposData = (await reposResponse.json()) as GitHubRepo[]

        const normalizedProjects = reposData
          .filter((repo) => !repo.fork && !repo.archived)
          .map(normalizeRepo)
          .sort((a, b) => b.score - a.score || +new Date(b.pushed_at) - +new Date(a.pushed_at))

        setProfile(profileData)
        setProjects(normalizedProjects)
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadGitHubPortfolio()
  }, [])

  const featuredProjects = useMemo(() => projects.slice(0, 3), [projects])

  const techFilters = useMemo(() => {
    const techs = projects.flatMap((project) => project.techs)
    return ['Todos', ...Array.from(new Set(techs)).slice(0, 8)]
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (activeTech === 'Todos') {
      return projects
    }

    return projects.filter((project) => project.techs.includes(activeTech))
  }, [activeTech, projects])

  const liveProjects = projects.filter((project) => project.homepage).length
  const primaryName = profile?.name?.trim() || profile?.login || 'Chrisllan Franco'

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Voltar ao inicio">
          CF
        </a>
        <nav aria-label="Navegacao principal">
          <a href="#projetos">Projetos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href={profile?.html_url ?? `https://github.com/${GITHUB_USERNAME}`} target="_blank">
            GitHub
          </a>
        </nav>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <h1>Portfólio</h1>
          <p>
            Sou {primaryName}, desenvolvedor focado em transformar ideias em produtos
            digitais úteis, bem acabados e conectados com dados reais.
          </p>
          <div className="about-fields" aria-label="Tecnologias e frentes de atuacao">
            <div>
              <span>Tec</span>
              <strong>TypeScript, React, Vite, CSS, APIs e integrações web.</strong>
            </div>
            <div>
              <span>Frentes de atuação</span>
              <strong>Web apps, dashboards, dados públicos, extensões Chrome, UX/UI e automação.</strong>
            </div>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#projetos">
              Ver projetos
            </a>
            <a
              className="button secondary"
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
            >
              Abrir GitHub
            </a>
          </div>
        </div>

        <aside className="profile-card" aria-label="Resumo do perfil GitHub">
          <div className="profile-card-glow" />
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={`Avatar de ${primaryName}`} />
          ) : (
            <div className="avatar-skeleton" />
          )}
          <div>
            <strong>{primaryName}</strong>
            <span>@{profile?.login ?? GITHUB_USERNAME}</span>
          </div>
          <p>
            {profile?.bio ??
              'Desenvolvedor focado em produtos digitais, integrações web e experiências com dados reais.'}
          </p>
          <dl>
            <div>
              <dt>Repos</dt>
              <dd>{profile?.public_repos ?? projects.length}</dd>
            </div>
            <div>
              <dt>Lives</dt>
              <dd>{liveProjects}</dd>
            </div>
            <div>
              <dt>Seguidores</dt>
              <dd>{profile?.followers ?? 0}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Projetos em destaque</h2>
          <p>Ordenados por demo online, descrição, estrelas e atualização recente.</p>
        </div>

        <div className="featured-grid">
          {status === 'loading' && <LoadingCards />}
          {status === 'error' && <ErrorState />}
          {status === 'ready' &&
            featuredProjects.map((project) => <ProjectCard key={project.id} project={project} featured />)}
        </div>
      </section>

      <section className="section-block" id="projetos">
        <div className="section-heading with-action">
          <div>
            <h2>Todos os projetos</h2>
            <p>Filtre por linguagem ou topic publicado no próprio GitHub.</p>
          </div>
          <span>{filteredProjects.length} projetos</span>
        </div>

        <div className="filters" aria-label="Filtros de tecnologia">
          {techFilters.map((tech) => (
            <button
              className={activeTech === tech ? 'active' : ''}
              key={tech}
              onClick={() => setActiveTech(tech)}
              type="button"
            >
              {tech}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {status === 'ready' &&
            filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>

      <section className="workflow-section" id="como-funciona">
        <div>
          <h2>GitHub vira CMS.</h2>
          <p>
            O MVP usa os campos que você já mantém nos repositórios: descrição,
            homepage, linguagem, topics, estrelas e data de push.
          </p>
        </div>
        <div className="workflow-list">
          <article>
            <strong>1</strong>
            <h3>Publicou no GitHub</h3>
            <p>O repositório entra automaticamente na vitrine pública.</p>
          </article>
          <article>
            <strong>2</strong>
            <h3>Adicionou homepage</h3>
            <p>O card ganha CTA para abrir a demonstração online.</p>
          </article>
          <article>
            <strong>3</strong>
            <h3>Usou topics</h3>
            <p>O projeto passa a aparecer nos filtros de tecnologia.</p>
          </article>
        </div>
      </section>

      <footer>
        <span>Portfolio dinamico de {primaryName}</span>
        <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank">
          github.com/{GITHUB_USERNAME}
        </a>
      </footer>
    </main>
  )
}

function ProjectCard({ project, featured = false }: { project: PortfolioProject; featured?: boolean }) {
  return (
    <article className={featured ? 'project-card featured' : 'project-card'}>
      <div className="project-topline">
        <span
          className="language-dot"
          style={{ background: languageColors[project.language ?? ''] ?? '#94a3b8' }}
        />
        <span>{project.language ?? 'Projeto'}</span>
        <span>{formatDate(project.pushed_at)}</span>
      </div>
      <h3>{project.displayName}</h3>
      <p>{project.description ?? 'Sem descrição no GitHub. Atualize o campo About para enriquecer o card.'}</p>
      <div className="tech-list">
        {project.techs.slice(0, 4).map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <div className="project-actions">
        {project.homepage && (
          <a href={project.homepage} target="_blank">
            Demo
          </a>
        )}
        <a href={project.html_url} target="_blank">
          Codigo
        </a>
        <span>{project.stargazers_count} estrelas</span>
      </div>
    </article>
  )
}

function LoadingCards() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div className="project-card loading" key={item}>
          <span />
          <strong />
          <p />
          <p />
        </div>
      ))}
    </>
  )
}

function ErrorState() {
  return (
    <div className="error-state">
      <h3>Nao foi possivel carregar o GitHub agora.</h3>
      <p>O layout continua pronto; tente atualizar a pagina ou configurar um token server-side na proxima etapa.</p>
    </div>
  )
}

export default App

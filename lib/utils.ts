import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTechIconUrl(tech: string): string {
  const map: Record<string, string> = {
    react: "react/react-original.svg",
    "next.js": "nextjs/nextjs-original.svg",
    "node.js": "nodejs/nodejs-original.svg",
    python: "python/python-original.svg",
    go: "go/go-original.svg",
    typescript: "typescript/typescript-original.svg",
    java: "java/java-original.svg",
    docker: "docker/docker-original.svg",
    postgresql: "postgresql/postgresql-original.svg",
    mongodb: "mongodb/mongodb-original.svg",
    terraform: "terraform/terraform-original.svg",
    rust: "rust/rust-original.svg",
    vue: "vuejs/vuejs-original.svg",
    angular: "angularjs/angularjs-original.svg",
    "spring boot": "spring/spring-original.svg",
    django: "django/django-plain.svg",
    kubernetes: "kubernetes/kubernetes-plain.svg",
    aws: "amazonwebservices/amazonwebservices-original-wordmark.svg",
    gcp: "googlecloud/googlecloud-original.svg",
    azure: "azure/azure-original.svg",
    redis: "redis/redis-original.svg",
    graphql: "graphql/graphql-plain.svg",
  }

  const normalized = tech.toLowerCase()
  const iconPath = map[normalized]
  if (iconPath) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconPath}`
  }
  return ""
}

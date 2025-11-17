import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Second Brain',
    short_name: 'Second Brain',
    description: 'AI-powered notes, tasks, reminders, files, and chat',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f14',
    theme_color: '#0b0f14',
    icons: []
  };
}

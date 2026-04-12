import { Helmet } from 'react-helmet-async';

interface CanonicalProps {
  path: string;
  title?: string;
  description?: string;
}

const BASE_URL = 'https://servicioshogar.com.ar';

export default function Canonical({ path, title, description }: CanonicalProps) {
  return (
    <Helmet>
      <link rel="canonical" href={`${BASE_URL}${path}`} />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}

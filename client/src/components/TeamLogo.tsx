interface TeamLogoProps {
  logo?: string;
  flag?: string;
  name: string;
  className?: string;
}

export default function TeamLogo({ logo, flag, name, className = "" }: TeamLogoProps) {
  if (logo) {
    return (
      <img 
        src={logo} 
        alt={`${name} logo`}
        className={`object-contain ${className}`}
        onError={(e) => {
          // If logo fails to load, show flag as fallback
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling;
          if (fallback) {
            (fallback as HTMLElement).style.display = 'block';
          }
        }}
      />
    );
  }
  
  // Fallback to flag if no logo
  return <span className={className}>{flag || '🏆'}</span>;
}

interface ArtDecoCornerProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size?: number
  delay?: number
}

export function ArtDecoCorner({ position, size = 60, delay = 0 }: ArtDecoCornerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0'
      case 'top-right':
        return 'top-0 right-0'
      case 'bottom-left':
        return 'bottom-0 left-0'
      case 'bottom-right':
        return 'bottom-0 right-0'
    }
  }

  const getRotation = () => {
    switch (position) {
      case 'top-left':
        return 'rotate(0deg)'
      case 'top-right':
        return 'rotate(90deg)'
      case 'bottom-right':
        return 'rotate(180deg)'
      case 'bottom-left':
        return 'rotate(270deg)'
    }
  }

  return (
    <div 
      className={`absolute ${getPositionClasses()} m-0! pointer-events-none corner-accent`}
      style={{ 
        width: size, 
        height: size,
        animationDelay: `${delay}s`
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: getRotation() }}
      >
        <path
          d="M 0 0 L 40 0"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground/60"
          style={{ 
            filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))'
          }}
        />
        <path
          d="M 0 0 L 0 40"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground/60"
          style={{ 
            filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))'
          }}
        />
        <path
          d="M 5 5 L 25 5"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/50"
        />
        <path
          d="M 5 5 L 5 25"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground/50"
        />
        <circle
          cx="3"
          cy="3"
          r="2"
          fill="currentColor"
          className="text-primary"
          style={{ 
            filter: 'drop-shadow(0 0 6px rgba(102, 51, 153, 0.8))'
          }}
        />
        <circle
          cx="28"
          cy="3"
          r="1.5"
          fill="currentColor"
          className="text-foreground/70"
        />
        <circle
          cx="3"
          cy="28"
          r="1.5"
          fill="currentColor"
          className="text-foreground/70"
        />
      </svg>
    </div>
  )
}

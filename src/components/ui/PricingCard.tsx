interface PricingCardProps {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  price: string;
  savings?: string;
  isPopular?: boolean;
  onPurchase: () => void;
  onDetails?: () => void;
}

export default function PricingCard({
  title,
  subtitle,
  description,
  duration,
  price,
  savings,
  isPopular = false,
  onPurchase,
  onDetails,
}: PricingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative h-full">
      {/* Popular Badge - Fixed in top left corner */}
      {isPopular && (
        <div className="absolute top-0 left-0">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-tl-2xl rounded-br-lg">
            Mas popular
          </span>
        </div>
      )}

      {/* Content Container - Centered vertically */}
      <div className="flex flex-col justify-center items-center text-center h-full space-y-3">
        {/* Icon */}
        <div className="bg-primary mt-8 mb-10 w-12 h-12 rounded-lg flex items-center justify-center ">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-primary">{title}</h3>

        {/* Subtitle */}
        <p className="text-primary font-medium text-sm">{subtitle}</p>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>

        {/* Duration */}
        <div className="flex items-center text-gray-500 text-sm">
          <svg
            className="w-4 h-4 mr-2 text-primary-foreground"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          <span>Duración: {duration}</span>
        </div>

        {/* Price and Buttons */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold text-primary">{price}</span>
            {savings && <p className="text-gray-500 text-xs">({savings})</p>}
          </div>
          <button
            onClick={onPurchase}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Comprar ahora
          </button>
          {onDetails && (
            <button
              onClick={onDetails}
              className="bg-white text-primary border border-primary px-6 py-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Ver detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

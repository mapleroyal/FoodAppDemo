import { useState, useEffect, useRef } from "react";
import { Utensils, RotateCw, Sparkles, MapPin, Star } from "lucide-react";

/**
 * FOOD DATA CONFIGURATION
 * A list of potential food options. Each object contains:
 * - id: unique identifier
 * - name: Title of the food
 * - emoji: Fallback visual if image fails
 * - cuisine: Category
 * - image: High-quality Unsplash URL
 */
const FOOD_OPTIONS = [
  {
    id: 1,
    name: "Gourmet Burger",
    emoji: "🍔",
    cuisine: "American",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Artisan Pizza",
    emoji: "🍕",
    cuisine: "Italian",
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Fresh Sushi",
    emoji: "🍣",
    cuisine: "Japanese",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Street Tacos",
    emoji: "🌮",
    cuisine: "Mexican",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "Pad Thai",
    emoji: "🍜",
    cuisine: "Thai",
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "Healthy Salad",
    emoji: "🥗",
    cuisine: "Fresh",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    name: "Butter Chicken",
    emoji: "🍛",
    cuisine: "Indian",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "Avocado Toast",
    emoji: "🥑",
    cuisine: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=800&q=80",
  },
];

const FoodAppDemo = () => {
  // --- STATE MANAGEMENT ---

  // Tracks the index of the food currently being displayed
  const [currentIndex, setCurrentIndex] = useState(0);

  // Boolean to check if the roulette is currently animating
  const [isSpinning, setIsSpinning] = useState(false);

  // The final chosen food object (null until a spin completes)
  const [winner, setWinner] = useState(null);

  // Used to store the Interval ID so we can clear it later (cleanup)
  const intervalRef = useRef(null);

  // --- ANIMATION LOGIC ---

  /**
   * Handles the "Spin" mechanic.
   * 1. Resets any previous winner.
   * 2. Starts an interval that rapidly changes the currentIndex.
   * 3. Sets a timeout to stop the interval after a set time.
   */
  const handleSpin = () => {
    if (isSpinning) return; // Prevent double clicks

    setIsSpinning(true);
    setWinner(null);

    // Speed of the shuffling effect (in milliseconds)
    const speed = 100;

    // Start shuffling through the array
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % FOOD_OPTIONS.length);
    }, speed);

    // Stop shuffling after 3 seconds (3000ms)
    setTimeout(() => {
      stopSpin();
    }, 3000);
  };

  const stopSpin = () => {
    // Clear the interval to stop the shuffling
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Determine the winner based on where the index landed
    // We add a random offset to ensure it doesn't always land on the same visual timing
    const randomIndex = Math.floor(Math.random() * FOOD_OPTIONS.length);
    setCurrentIndex(randomIndex);
    setWinner(FOOD_OPTIONS[randomIndex]);
    setIsSpinning(false);
  };

  // Cleanup: If the component unmounts (closes) while spinning, stop the interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4 font-sans text-slate-800">
      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">
        {/* Header Section */}
        <div className="bg-slate-900 text-white p-6 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
              <Utensils className="w-6 h-6 text-orange-400" />
              CraveDecider
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Can't decide? Let fate choose.
            </p>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Display Area (The "Screen") */}
        <div className="p-8 flex flex-col items-center">
          {/* The Image/Card Carousel */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-slate-100 mb-8 group">
            {/* We map over the food options but only show the active one.
              Using absolute positioning allows us to transition opacity for a smooth effect.
            */}
            {FOOD_OPTIONS.map((food, index) => (
              <div
                key={food.id}
                className={`absolute inset-0 transition-all duration-200 ease-in-out transform flex flex-col items-center justify-center
                  ${
                    index === currentIndex
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }
                `}
              >
                {/* Image with Emoji fallback logic handled via standard img tag behavior */}
                <img
                  src={food.image}
                  alt={food.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails (e.g. no internet)
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />

                {/* Fallback Container (Hidden by default unless image errors) */}
                <div className="hidden w-full h-full bg-orange-100 items-center justify-center text-9xl">
                  {food.emoji}
                </div>

                {/* Overlay Text (Only visible during spin or idle, hidden on winner result to avoid clutter) */}
                {!winner && (
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
                    <h2 className="text-2xl font-bold">{food.name}</h2>
                    <span className="text-xs uppercase tracking-wider bg-orange-500 px-2 py-0.5 rounded text-white font-semibold">
                      {food.cuisine}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Winner Overlay - Only appears when a choice is finalized */}
            {winner && !isSpinning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 animation-fade-in">
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center transform animate-bounce-short">
                  <div className="text-5xl mb-2">{winner.emoji}</div>
                  <h3 className="text-xl font-bold text-slate-800">
                    You're eating:
                  </h3>
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-2">
                    {winner.name}
                  </h2>
                  <div className="flex justify-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
              ${
                isSpinning
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-orange-500/30 hover:-translate-y-1"
              }
            `}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-6 h-6 animate-spin" />
                Finding Lunch...
              </>
            ) : winner ? (
              <>
                <RotateCw className="w-6 h-6" />
                Spin Again
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                I'm Hungry!
              </>
            )}
          </button>

          {/* Footer Info */}
          {winner && !isSpinning && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 w-full flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Suggestion:
                </p>
                <p className="text-xs text-green-700">
                  Open your maps app and search for
                  <span className="font-bold"> "{winner.name}" </span>
                  near you!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for custom bounce animation */}
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FoodAppDemo;

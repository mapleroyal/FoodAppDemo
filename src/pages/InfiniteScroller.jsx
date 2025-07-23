import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";

// --- CONFIGURATION ---
const TOTAL_ITEMS = 100; // Total number of items to keep in the DOM at any time.
const LOAD_BATCH_SIZE = 25; // Number of items to load/unload in one go.
const ITEM_HEIGHT = 60; // Must match the CSS height for accurate scroll calculations.
const SCROLL_THRESHOLD = 500; // Pixel distance from edges to trigger loading new items.

// --- STYLES ---
// Using a style object for component encapsulation.
const styles = {
  scroller: {
    height: "100vh",
    width: "100%",
    overflowY: "scroll",
    border: "2px solid #4a5568",
    boxSizing: "border-box",
    backgroundColor: "#f7fafc",
    // Disables the browser's native scroll anchoring, as we handle it manually.
    // This is a crucial "best practice" addition for this pattern.
    overflowAnchor: "none",
  },
  content: {
    position: "relative",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: `${ITEM_HEIGHT}px`,
    fontSize: "1.1rem",
    color: "#2d3748",
    borderBottom: "1px solid #e2e8f0",
    userSelect: "none",
  },
  itemEven: {
    backgroundColor: "#edf2f7",
  },
  itemOdd: {
    backgroundColor: "#ffffff",
  },
};

/**
 * Creates the initial array of item indices, centered around 0.
 * e.g., for TOTAL_ITEMS = 100, it generates [-50, -49, ..., 0, ..., 48, 49].
 */
const getInitialItems = () => {
  const initialFirstIndex = -Math.floor(TOTAL_ITEMS / 2);
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => initialFirstIndex + i);
};

export default function InfiniteScroller() {
  const [items, setItems] = useState(getInitialItems);
  const scrollerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // This ref stores the necessary data to correct the scroll position after a DOM update.
  // It's the key to bridging the gap between a React state update and a manual DOM side effect.
  const scrollCorrectionRef = useRef(null);

  /**
   * This is the core logic for a smooth, jump-free experience, especially on Safari.
   * It runs synchronously after React updates the DOM but before the browser can paint the changes.
   */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scrollCorrectionRef.current || !scroller) return;

    const { oldScrollTop, direction } = scrollCorrectionRef.current;
    const addedHeight = LOAD_BATCH_SIZE * ITEM_HEIGHT;

    // Adjust the scroll position to counteract the visual shift from adding/removing items.
    if (direction === "up") {
      // If we added items to the top, the content gets pushed down.
      // We must increase scrollTop to keep the user's view stable.
      scroller.scrollTop = oldScrollTop + addedHeight;
    } else if (direction === "down") {
      // If we removed items from the top, the content shifts up.
      // We must decrease scrollTop to compensate.
      scroller.scrollTop = oldScrollTop - addedHeight;
    }

    // ** THE SAFARI FIX - PART 2 **
    // Restore the overflow property now that the scroll position is corrected.
    // This happens in the same synchronous phase, so the user never sees the scrollbar disappear.
    scroller.style.overflowY = "scroll";

    // Reset the correction data.
    scrollCorrectionRef.current = null;

    // ** THE MOBILE SAFARI SCROLL-HALT FIX **
    // We delay resetting the `isLoading` flag until the next animation frame.
    // This gives the browser a full paint cycle to process the scroll adjustment
    // and prevents new scroll events from firing prematurely, which would halt scroll momentum.
    requestAnimationFrame(() => {
      isLoadingRef.current = false;
    });
  }, [items]); // This effect MUST run every time the `items` array changes.

  /**
   * This effect runs only once on mount to center the initial viewport.
   */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) / 2;
    }
  }, []); // Empty dependency array ensures it runs only once.

  /**
   * The function to trigger loading new data and updating the items state.
   */
  const loadItems = useCallback((direction) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    // ** THE SAFARI FIX - PART 1 **
    // Temporarily hide the overflow. This prevents Safari from painting an intermediate
    // state where the DOM is updated but the scroll position is not yet corrected,
    // which is the cause of the visual "jump".
    scroller.style.overflowY = "hidden";

    // Capture the current scroll position *before* the state update triggers a re-render.
    const oldScrollTop = scroller.scrollTop;
    scrollCorrectionRef.current = { oldScrollTop, direction };

    // Update the state to trigger the re-render with the new set of items.
    setItems((currentItems) => {
      if (direction === "up") {
        const firstIndex = currentItems[0];
        const newItems = Array.from(
          { length: LOAD_BATCH_SIZE },
          (_, i) => firstIndex - LOAD_BATCH_SIZE + i
        );
        // Prepend new items and remove the same number of items from the end.
        return [...newItems, ...currentItems.slice(0, -LOAD_BATCH_SIZE)];
      } else {
        // 'down'
        const lastIndex = currentItems[currentItems.length - 1];
        const newItems = Array.from(
          { length: LOAD_BATCH_SIZE },
          (_, i) => lastIndex + 1 + i
        );
        // Append new items and remove the same number of items from the start.
        return [...currentItems.slice(LOAD_BATCH_SIZE), ...newItems];
      }
    });
  }, []); // This function is memoized and doesn't need any dependencies.

  /**
   * The scroll event handler that checks scroll position and triggers loads.
   */
  const handleScroll = useCallback(() => {
    if (isLoadingRef.current) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollTop, scrollHeight, clientHeight } = scroller;

    if (scrollTop < SCROLL_THRESHOLD) {
      loadItems("up");
    } else if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      loadItems("down");
    }
  }, [loadItems]); // Re-create this handler only if `loadItems` changes.

  /**
   * Attaches and cleans up the scroll event listener.
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      // Use a passive listener for better scroll performance.
      scroller.addEventListener("scroll", handleScroll, { passive: true });
      return () => scroller.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div ref={scrollerRef} style={styles.scroller}>
      <div style={styles.content}>
        {items.map((itemNumber) => (
          <div
            key={itemNumber}
            style={{
              ...styles.item,
              ...(Math.abs(itemNumber) % 2 === 0
                ? styles.itemEven
                : styles.itemOdd),
            }}
          >
            Item {itemNumber}
          </div>
        ))}
      </div>
    </div>
  );
}

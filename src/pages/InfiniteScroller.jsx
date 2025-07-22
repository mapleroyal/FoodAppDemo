import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";

// --- CONFIGURATION ---
// These could be passed as props for a more reusable component
const TOTAL_ITEMS = 100; // Total number of items to keep in the DOM
const LOAD_BATCH_SIZE = 25; // Number of items to load/unload at a time
const ITEM_HEIGHT = 60; // Corresponds to the CSS height, used for calculations
const SCROLL_THRESHOLD = 500; // Pixels from an edge to trigger a load

// --- STYLES ---
// Using a style object for encapsulation within the component file
const styles = {
  scroller: {
    height: "100vh",
    width: "100%",
    overflowY: "scroll",
    border: "2px solid #4a5568",
    boxSizing: "border-box",
    backgroundColor: "#f7fafc",
    WebkitOverflowScrolling: "touch",
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
 */
const getInitialItems = () => {
  const initialFirstIndex = -Math.floor(TOTAL_ITEMS / 2);
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => initialFirstIndex + i);
};

export default function InfiniteScroller() {
  const [items, setItems] = useState(getInitialItems);
  const scrollerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // This ref holds information for the scroll position correction.
  // It's the key to preventing the visual jump.
  const scrollCorrectionRef = useRef(null);

  /**
   * This effect is the core of the smooth scrolling logic.
   * It runs after the DOM has been updated by React, but before the browser paints.
   * This allows us to adjust the scroll position imperceptibly.
   */
  useLayoutEffect(() => {
    if (!scrollCorrectionRef.current || !scrollerRef.current) return;

    const { oldScrollTop, direction } = scrollCorrectionRef.current;
    const addedHeight = LOAD_BATCH_SIZE * ITEM_HEIGHT;

    if (direction === "up") {
      // Content was added to the top, so we need to scroll down by the same amount.
      scrollerRef.current.scrollTop = oldScrollTop + addedHeight;
    } else if (direction === "down") {
      // Content was removed from the top, so we need to scroll up by the same amount.
      scrollerRef.current.scrollTop = oldScrollTop - addedHeight;
    }

    // Reset the correction info and unlock loading
    scrollCorrectionRef.current = null;
    isLoadingRef.current = false;
  }, [items]); // This effect depends on the `items` state

  /**
   * This effect runs once on mount to center the initial view.
   */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      // Start the view in the middle of the rendered content
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) / 2;
    }
  }, []); // Empty dependency array ensures it runs only once

  /**
   * Logic to load new items when scrolling reaches the top or bottom.
   */
  const loadItems = useCallback((direction) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Capture scroll position *before* state change triggers a re-render.
    const oldScrollTop = scroller.scrollTop;

    // Store correction info for useLayoutEffect
    scrollCorrectionRef.current = { oldScrollTop, direction };

    setItems((currentItems) => {
      if (direction === "up") {
        const firstIndex = currentItems[0];
        const newItems = Array.from(
          { length: LOAD_BATCH_SIZE },
          (_, i) => firstIndex - LOAD_BATCH_SIZE + i
        );
        // Add new items to the start, remove from the end
        return [...newItems, ...currentItems.slice(0, -LOAD_BATCH_SIZE)];
      } else {
        // 'down'
        const lastIndex = currentItems[currentItems.length - 1];
        const newItems = Array.from(
          { length: LOAD_BATCH_SIZE },
          (_, i) => lastIndex + 1 + i
        );
        // Add new items to the end, remove from the start
        return [...currentItems.slice(LOAD_BATCH_SIZE), ...newItems];
      }
    });
  }, []); // No dependencies, as it gets all it needs from refs and arguments

  /**
   * Scroll event handler.
   */
  const handleScroll = useCallback(() => {
    if (isLoadingRef.current) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollTop, scrollHeight, clientHeight } = scroller;

    // Check if near the top
    if (scrollTop < SCROLL_THRESHOLD) {
      loadItems("up");
    }
    // Check if near the bottom
    else if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      loadItems("down");
    }
  }, [loadItems]);

  /**
   * Sets up and tears down the scroll event listener.
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
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

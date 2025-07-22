This project provides a scaffolding for a modern web application, integrating several popular front-end technologies to facilitate rapid development and maintainability.

## Tech Stack

*   **Vite**: A next-generation frontend tooling that offers a fast and optimized development experience, featuring lightning-fast cold server start and instant Hot Module Replacement (HMR).
*   **React**: A declarative and efficient JavaScript library for building user interfaces, enabling component-based development.
*   **React Router v7**: Used in Declarative Mode, similar to v6, for straightforward navigation and routing within the application.
*   **Tailwind CSS**: A utility-first CSS framework that allows for rapid UI development by composing classes directly in your markup to create custom designs.
*   **Material-UI (MUI)**: A comprehensive collection of React UI components based on Google's Material Design, designed to accelerate the development of elegant and responsive user interfaces.

# Dev Notes

Here is the original html infinite scroller vanilla html/css/js version that works in all (desktop) browsers, and safari on desktop/mobile, and the requirements:

- It is an infinite, bidirectional scroller (vertical)
- When loading on either end, there is not a jarring visual jump
- When loading on either end, the number of rows loaded are removed from the other end, maintaining the same total number of items (some on screen, and some above and below as a buffer)
- It doesn't have a fixed height or width, it doesn't rely on fixed total dimensions
- Each row is numbered
- The view starts centered
- Wireframe, minimal styling

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinite Bidirectional Scroller</title>
    <style>
        /* Basic styles for the wireframe layout */
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden; /* Prevent body from scrolling */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* The main scroll container. It fills the viewport. */
        #scroller {
            height: 100vh;
            width: 100%;
            overflow-y: scroll;
            border: 2px solid #4a5568;
            box-sizing: border-box;
            background-color: #f7fafc;
            /* Improves scroll performance on some browsers */
            -webkit-overflow-scrolling: touch;
        }

        /* The content wrapper holds all the items. */
        #content {
            position: relative;
        }

        /* Individual item styling. A fixed height is crucial for calculations. */
        .item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 60px;
            font-size: 1.1rem;
            color: #2d3748;
            border-bottom: 1px solid #e2e8f0;
            user-select: none; /* Prevents text selection on drag */
        }

        /* Colors are applied via JS based on the item's number */
        .item-even {
            background-color: #edf2f7;
        }
        .item-odd {
            background-color: #ffffff;
        }
    </style>
</head>
<body>

    <div id="scroller">
        <div id="content"></div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // --- CONFIGURATION ---
            const TOTAL_ITEMS_IN_DOM = 100;
            const LOAD_BATCH_SIZE = 25;
            const SCROLL_THRESHOLD = 500; // Pixels from the edge to trigger a load.

            // --- DOM ELEMENTS ---
            const scroller = document.getElementById('scroller');
            const content = document.getElementById('content');

            // --- STATE ---
            let firstItemIndex = 0;
            let itemHeight = 60; // Must match the CSS height for calculations.
            let isLoading = false;

            /**
             * Creates a single item element with a given index and applies color.
             */
            function createItemElement(index) {
                const item = document.createElement('div');
                item.classList.add('item');
                item.textContent = `Item ${index}`;
                if (Math.abs(index) % 2 === 0) {
                    item.classList.add('item-even');
                } else {
                    item.classList.add('item-odd');
                }
                return item;
            }

            /**
             * FIX: Loads new items, removes old ones, and adjusts scroll position smoothly.
             * The key change is to batch DOM manipulations (adds and removes) separately
             * to prevent the browser from rendering intermediate states, which causes the jump.
             */
            function loadItems(direction) {
                if (isLoading) return;
                isLoading = true;

                // We capture the scroll position *before* making any DOM changes.
                const oldScrollTop = scroller.scrollTop;

                // Use requestAnimationFrame to ensure all our work happens right before the next paint.
                requestAnimationFrame(() => {
                    if (direction === 'up') {
                        const newFirstIndex = firstItemIndex - LOAD_BATCH_SIZE;
                        const fragment = document.createDocumentFragment();

                        // 1. Batch-create new items to add to the top.
                        for (let i = firstItemIndex - 1; i >= newFirstIndex; i--) {
                            fragment.insertBefore(createItemElement(i), fragment.firstChild);
                        }

                        // 2. Add new items to the DOM in a single operation.
                        content.insertBefore(fragment, content.firstChild);

                        // 3. Batch-remove old items from the bottom.
                        for (let i = 0; i < LOAD_BATCH_SIZE; i++) {
                            content.removeChild(content.lastChild);
                        }

                        // 4. Update the index state.
                        firstItemIndex = newFirstIndex;

                        // 5. Adjust scroll position. The content was pushed down by the height
                        // of the new items. We increase scrollTop to keep the view stable.
                        const addedHeight = LOAD_BATCH_SIZE * itemHeight;
                        scroller.scrollTop = oldScrollTop + addedHeight;

                    } else if (direction === 'down') {
                        const currentLastIndex = firstItemIndex + TOTAL_ITEMS_IN_DOM - 1;
                        const fragment = document.createDocumentFragment();

                        // 1. Batch-create new items to add to the bottom.
                        for (let i = 1; i <= LOAD_BATCH_SIZE; i++) {
                            fragment.appendChild(createItemElement(currentLastIndex + i));
                        }

                        // 2. Add new items to the DOM in a single operation.
                        content.appendChild(fragment);

                        // 3. Batch-remove old items from the top.
                        for (let i = 0; i < LOAD_BATCH_SIZE; i++) {
                            content.removeChild(content.firstChild);
                        }

                        // 4. Update the index state.
                        firstItemIndex += LOAD_BATCH_SIZE;

                        // 5. Adjust scroll position. Removing items from the top shifted all
                        // content up. We must decrease scrollTop to keep the view stable.
                        const removedHeight = LOAD_BATCH_SIZE * itemHeight;
                        scroller.scrollTop = oldScrollTop - removedHeight;
                    }

                    // We reset the isLoading flag in the *next* animation frame.
                    // This gives the browser a full frame to render the changes and update
                    // its internal scroll metrics *before* we allow another load to be triggered.
                    requestAnimationFrame(() => {
                        isLoading = false;
                    });
                });
            }

            /**
             * The main scroll event handler.
             */
            function handleScroll() {
                if (isLoading) return;

                const { scrollTop, scrollHeight, clientHeight } = scroller;

                // Check if we're near the top
                if (scrollTop < SCROLL_THRESHOLD) {
                    loadItems('up');
                }
                // Check if we're near the bottom
                else if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
                    loadItems('down');
                }
            }

            /**
             * Initializes the scroller.
             */
            function initialize() {
                firstItemIndex = -Math.floor(TOTAL_ITEMS_IN_DOM / 2);
                const lastItemIndex = firstItemIndex + TOTAL_ITEMS_IN_DOM;

                for (let i = firstItemIndex; i < lastItemIndex; i++) {
                    content.appendChild(createItemElement(i));
                }

                // Measure the true item height from the DOM after first render, just in case.
                if (content.firstChild) {
                    itemHeight = content.firstChild.offsetHeight;
                }

                // Start centered.
                scroller.scrollTop = (content.scrollHeight - scroller.clientHeight) / 2;

                scroller.addEventListener('scroll', handleScroll, { passive: true });

                console.log('Infinite scroller initialized.');
            }

            initialize();
        });
    </script>

</body>
</html>
```

Here's the initial react conversion of that, which works flawlessly on desktop chrome/firefox, but is broken on desktop/mobile safari where it has a jarring visual jump when loading new items at either end—however, on desktop safari everything else works (e.g. the colors stay consistent, no crazy bugs, and you can fling the scroll at either end) On mobile safari, in addition to the jump, the scroll comes to a halt whenever new items load at either end.

```jsx
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
```

This version works (with a very slight hiccup/jitter on loading SOMETIMES) on desktop safari/chrome/firefox, but is bugged on iphone safari: when items load in at either end, there is a jarring visual jump.

```jsx
import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";

// --- CONFIGURATION ---
const TOTAL_ITEMS = 100;
const LOAD_BATCH_SIZE = 25;
const ITEM_HEIGHT = 60;
const SCROLL_THRESHOLD = 500;

// --- STYLES ---
const styles = {
  scroller: {
    height: "100vh",
    width: "100%",
    overflowY: "scroll", // This will be toggled
    border: "2px solid #4a5568",
    boxSizing: "border-box",
    backgroundColor: "#f7fafc",
    overflowAnchor: "none", // Still a good practice
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

const getInitialItems = () => {
  const initialFirstIndex = -Math.floor(TOTAL_ITEMS / 2);
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => initialFirstIndex + i);
};

export default function InfiniteScroller() {
  const [items, setItems] = useState(getInitialItems);
  const scrollerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const scrollCorrectionRef = useRef(null);

  useLayoutEffect(() => {
    if (!scrollCorrectionRef.current || !scrollerRef.current) return;

    const scroller = scrollerRef.current;
    const { oldScrollTop, direction } = scrollCorrectionRef.current;
    const addedHeight = LOAD_BATCH_SIZE * ITEM_HEIGHT;

    // Part 1: Restore the correct logic for a windowed scroller.
    // This fixes the runaway loading bug.
    if (direction === "up") {
      scroller.scrollTop = oldScrollTop + addedHeight;
    } else if (direction === "down") {
      scroller.scrollTop = oldScrollTop - addedHeight;
    }

    // Part 2: Restore the overflow after the scroll position is corrected.
    scroller.style.overflowY = "scroll";

    // Reset and unlock.
    scrollCorrectionRef.current = null;
    isLoadingRef.current = false;
  }, [items]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) / 2;
    }
  }, []);

  const loadItems = useCallback((direction) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Part 2: The Safari Fix. Hide the scrollbar during the DOM update.
    // This prevents the browser from painting the "jump" before we can correct it.
    scroller.style.overflowY = "hidden";

    const oldScrollTop = scroller.scrollTop;
    scrollCorrectionRef.current = { oldScrollTop, direction };

    setItems((currentItems) => {
      if (direction === "up") {
        const firstIndex = currentItems[0];
        const newItems = Array.from(
          { length: LOAD_BATCH_SIZE },
          (_, i) => firstIndex - LOAD_BATCH_SIZE + i
        );
        return [...newItems, ...currentItems.slice(0, -LOAD_BATCH_SIZE)];
      } else { // 'down'
        const lastIndex = currentItems[currentItems.length - 1];
        const newItems = Array.from(
          { length: LOAD_BATCH_SIZE },
          (_, i) => lastIndex + 1 + i
        );
        return [...currentItems.slice(LOAD_BATCH_SIZE), ...newItems];
      }
    });
  }, []);

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
  }, [loadItems]);

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
```
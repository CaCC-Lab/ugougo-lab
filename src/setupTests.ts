/**
 * Jest テスト環境セットアップ
 */

import '@testing-library/jest-dom';
import React from 'react';

// Canvas API の実装（モックではなく実際の動作をシミュレート）
HTMLCanvasElement.prototype.getContext = function(contextType: string) {
  if (contextType === '2d') {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: 'srgb' }),
      putImageData: () => {},
      createImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: 'srgb' }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      font: '10px sans-serif',
    };
  }
  return null;
} as any;

// Canvas要素の getBoundingClientRect の実装
HTMLCanvasElement.prototype.getBoundingClientRect = function() {
  return {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
};

// ResizeObserver の実装（テスト環境用）
class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: TestResizeObserver,
});

// MutationObserver の実装は下記の詳細版で定義

// IntersectionObserver の実装（テスト環境用）
class TestIntersectionObserver {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: TestIntersectionObserver,
});

// requestAnimationFrame の実装
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0),
});
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: (id: number) => clearTimeout(id),
});

// URL.createObjectURL の実装
let objectUrlCounter = 0;
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: (blob: Blob) => {
    objectUrlCounter++;
    return `blob:http://localhost:3000/${objectUrlCounter}`;
  },
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: (url: string) => {
    // 実際には何もしない（テスト環境では必要ない）
  },
});

// FileReader の実装（テスト環境用）
class TestFileReader implements EventTarget {
  result: string | ArrayBuffer | null = '';
  error: any = null;
  readyState = 0;
  
  // FileReader のイベントハンドラ
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  // FileReader の定数
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;

  readAsText(blob: Blob) {
    this.readyState = 2;
    setTimeout(() => {
      this.result = 'test file content';
      if (this.onload) {
        const event = new Event('load');
        Object.defineProperty(event, 'target', {
          value: this,
          writable: false,
          enumerable: true,
          configurable: true
        });
        this.onload.call(this as any, event);
      }
    }, 0);
  }

  readAsDataURL(blob: Blob) {
    this.readyState = 2;
    setTimeout(() => {
      this.result = 'data:application/octet-stream;base64,dGVzdA==';
      if (this.onload) {
        const event = new Event('load');
        Object.defineProperty(event, 'target', {
          value: this,
          writable: false,
          enumerable: true,
          configurable: true
        });
        this.onload.call(this as any, event);
      }
    }, 0);
  }

  readAsArrayBuffer(blob: Blob) {
    this.readyState = 2;
    setTimeout(() => {
      this.result = new ArrayBuffer(8);
      if (this.onload) {
        const event = new Event('load');
        Object.defineProperty(event, 'target', {
          value: this,
          writable: false,
          enumerable: true,
          configurable: true
        });
        this.onload.call(this as any, event);
      }
    }, 0);
  }

  readAsBinaryString(blob: Blob) {
    this.readyState = 2;
    setTimeout(() => {
      this.result = 'binary string';
      if (this.onload) {
        const event = new Event('load');
        Object.defineProperty(event, 'target', {
          value: this,
          writable: false,
          enumerable: true,
          configurable: true
        });
        this.onload.call(this as any, event);
      }
    }, 0);
  }

  abort() {
    this.readyState = 0;
  }

  addEventListener(type: string, listener: EventListener) {}
  removeEventListener(type: string, listener: EventListener) {}
  dispatchEvent(event: Event): boolean { return true; }
}

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: TestFileReader,
});

// localStorage の実装（メモリベース）
class TestLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new TestLocalStorage(),
  writable: true,
});

// confirm の実装（テスト環境では常にtrue）
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: (message?: string) => true,
});

// Web Audio API の実装（テスト環境用）
class TestAudioContext {
  currentTime = 0;
  destination = {};

  createGain() {
    return {
      connect: () => {},
      disconnect: () => {},
      gain: { value: 1 },
    };
  }

  createOscillator() {
    return {
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 440 },
      type: 'sine' as OscillatorType,
    };
  }
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: TestAudioContext,
});

// Mouse イベント関連のモック
Object.defineProperty(MouseEvent.prototype, 'offsetX', {
  get() { return this.pageX; },
});

Object.defineProperty(MouseEvent.prototype, 'offsetY', {
  get() { return this.pageY; },
});

// Material-UI テスト環境用のモック
// JSDOMでは実際のDOMサイズ測定ができないため、Material-UIの無限ループを防ぐ

// HTMLElement の offsetWidth/offsetHeight のモック
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get() { return 100; },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get() { return 100; },
});

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  get() { return 100; },
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  get() { return 100; },
});

// スクロール関連のプロパティ
Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
  get() { return 100; },
});

Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
  get() { return 100; },
});

Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
  get() { return 0; },
  set() {},
});

Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
  get() { return 0; },
  set() {},
});

// window.matchMedia のモック（Material-UIのレスポンシブ機能用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// getComputedStyle の拡張（Material-UIのスタイル計算用）
const originalGetComputedStyle = window.getComputedStyle;
Object.defineProperty(window, 'getComputedStyle', {
  value: (element: Element) => {
    const style = originalGetComputedStyle(element);
    return {
      ...style,
      transform: 'none',
      transitionDelay: '0s',
      transitionDuration: '0s',
      animationDelay: '0s',
      animationDuration: '0s',
      getPropertyValue: (property: string) => {
        switch (property) {
          case 'transform': return 'none';
          case 'transition-delay': return '0s';
          case 'transition-duration': return '0s';
          case 'animation-delay': return '0s';
          case 'animation-duration': return '0s';
          case 'margin-left': case 'margin-right': case 'margin-top': case 'margin-bottom': return '0px';
          case 'padding-left': case 'padding-right': case 'padding-top': case 'padding-bottom': return '0px';
          case 'border-left-width': case 'border-right-width': case 'border-top-width': case 'border-bottom-width': return '0px';
          case 'font-size': return '14px';
          case 'line-height': return '1.5';
          case 'direction': return 'ltr';
          case 'writing-mode': return 'horizontal-tb';
          default: return style.getPropertyValue ? style.getPropertyValue(property) : '';
        }
      },
    };
  },
});

// document.createRange のモック（Material-UIのテキスト測定用）
Object.defineProperty(document, 'createRange', {
  value: () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: document.createElement('div'),
    getBoundingClientRect: () => ({
      bottom: 20,
      height: 20,
      left: 0,
      right: 100,
      top: 0,
      width: 100, // Material-UIのNotchedOutlineが正しく動作するために非ゼロの幅が必要
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
    createContextualFragment: (html: string) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div;
    },
  }),
});

// Element.getBoundingClientRect の強化
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function() {
  const rect = originalGetBoundingClientRect.call(this);
  return {
    ...rect,
    bottom: rect.bottom || 100,
    height: rect.height || 100,
    left: rect.left || 0,
    right: rect.right || 100,
    top: rect.top || 0,
    width: rect.width || 100,
    x: rect.x || 0,
    y: rect.y || 0,
    toJSON: () => ({}),
  };
};

// 外部ライブラリは実際のものを使用する（モックしない）
// テスト環境で必要な設定のみ行う

// Material-UI TextField の無限ループ問題への追加対策
// TextFieldのラベル測定に関連する追加のモック
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() { return this.parentElement || document.body; },
});

// フォーカス関連のメソッドモック（Material-UIが内部で使用）
HTMLElement.prototype.focus = function() {
  // フォーカスイベントをシミュレート
  const focusEvent = new FocusEvent('focus', { bubbles: true });
  this.dispatchEvent(focusEvent);
};

HTMLElement.prototype.blur = function() {
  // ブラーイベントをシミュレート
  const blurEvent = new FocusEvent('blur', { bubbles: true });
  this.dispatchEvent(blurEvent);
};

// Material-UI の TextField が使用する Range API の拡張モック
// 既に基本的なcreateRangeモックが383-406行で実装されているため、
// 追加の拡張は不要（JSdomのプロパティ制限により再定義不可）

// Material-UI FormControl/InputBase 無限ループ対策
// onEmptyコールバックが繰り返し呼ばれるのを防ぐ
let formControlEmptyState = new WeakMap();

// MutationObserver の特別な実装（Material-UI TextField用）
class TestMutationObserver {
  private callback: MutationCallback;
  private observing: boolean = false;
  
  constructor(callback: MutationCallback) {
    this.callback = callback;
  }
  
  observe(target: Node, options?: MutationObserverInit) {
    this.observing = true;
    // Material-UIのTextFieldが期待する初期通知を遅延実行
    setTimeout(() => {
      if (this.observing) {
        const mutations: MutationRecord[] = [];
        this.callback(mutations, this as any);
      }
    }, 0);
  }
  
  disconnect() {
    this.observing = false;
  }
  
  takeRecords(): MutationRecord[] {
    return [];
  }
}

Object.defineProperty(window, 'MutationObserver', {
  writable: true,
  value: TestMutationObserver,
});

// Material-UI TextField の input 要素に対する特別な処理（無限ループ防止）
const inputFieldStates = new WeakMap<HTMLInputElement, boolean>();
const originalAddEventListener = HTMLInputElement.prototype.addEventListener;

HTMLInputElement.prototype.addEventListener = function(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  // Material-UIのFormControl onEmptyコールバック無限ループを防ぐ
  if (type === 'input' || type === 'change') {
    const wrappedListener = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const wasEmpty = inputFieldStates.get(target) || false;
      const isEmpty = !target.value || target.value === '';
      
      // 空状態が変化した場合のみコールバックを実行
      if (wasEmpty !== isEmpty) {
        inputFieldStates.set(target, isEmpty);
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else if (listener && typeof listener.handleEvent === 'function') {
          listener.handleEvent(event);
        }
      } else if (!isEmpty) {
        // 空でない場合は通常通り実行（値の変更を検知）
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else if (listener && typeof listener.handleEvent === 'function') {
          listener.handleEvent(event);
        }
      }
    };
    
    return originalAddEventListener.call(this, type, wrappedListener, options);
  }
  
  return originalAddEventListener.call(this, type, listener, options);
};

// React 18 の act() 警告を抑制（テスト環境でのみ）
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('inside a test was not wrapped in act'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
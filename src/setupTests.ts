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

// 外部ライブラリは実際のものを使用する（モックしない）
// テスト環境で必要な設定のみ行う
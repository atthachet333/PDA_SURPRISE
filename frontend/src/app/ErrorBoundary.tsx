import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Which world the failure happened in. The two shells look nothing alike, and
   * a corporate error panel appearing inside /us would break the private
   * experience far more than the error itself.
   */
  variant: 'corporate' | 'ai';
}

interface State {
  failed: boolean;
}

/**
 * The last line of defence for a render error.
 *
 * Without this, one thrown error in any component unmounts the whole tree and
 * the visitor is left looking at a white page with no way back. React has no
 * hook equivalent for this, so it stays a class.
 *
 * WHAT IS NOT SHOWN: no stack, no component name, no error message. In
 * production those leak implementation detail to a stranger, and to the person
 * this was built for they are just frightening. The real error still reaches
 * the console for a developer to read.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Development only: in production this is dead code and the bundler drops
    // it, so a visitor's console stays clean.
    if (import.meta.env.DEV) {
      console.error('Render error caught by boundary:', error, info.componentStack);
    }
  }

  private reload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;

    if (this.props.variant === 'ai') {
      /*
       * Stays inside the A&I world: same night sky, same typography, Thai copy,
       * and a way back to the beginning rather than to the corporate site.
       */
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-8 text-center">
          <span
            aria-hidden="true"
            className="mb-8 h-px w-24 bg-gradient-to-r from-transparent via-sky-200/50 to-transparent"
          />
          <p className="font-thai text-base leading-relaxed text-ivory/80">
            ตรงนี้มีบางอย่างไม่เรียบร้อย
            <br />
            ลองเปิดใหม่อีกครั้งนะ
          </p>
          <button
            type="button"
            onClick={this.reload}
            className="ai-pressable mt-10 min-h-11 rounded-pill border border-sky-200/40 bg-sky-400/10 px-6 font-thai text-sm text-ivory transition-colors hover:bg-sky-400/20"
          >
            เปิดใหม่
          </button>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-8 text-center">
        <p className="font-mono text-sm text-brand-600">ERROR</p>
        <h1 className="thai-display mt-4 text-2xl font-bold text-ink sm:text-3xl">
          หน้านี้มีปัญหาชั่วคราว
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-steel-500">
          ลองโหลดหน้านี้ใหม่อีกครั้ง หากยังไม่ได้ กรุณาติดต่อเราโดยตรง
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.reload}
            className="inline-flex min-h-11 items-center rounded-pill bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            โหลดใหม่
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center rounded-pill border border-steel-200 px-6 text-sm font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            กลับหน้าแรก
          </a>
        </div>
      </div>
    );
  }
}

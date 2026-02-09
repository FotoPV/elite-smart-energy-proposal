/**
 * In-memory generation progress tracker.
 * Tracks slide-by-slide generation progress for live preview.
 */

export interface SlideProgress {
  slideIndex: number;
  slideType: string;
  title: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  html?: string;
  error?: string;
}

export interface GenerationProgress {
  proposalId: number;
  status: 'idle' | 'calculating' | 'generating' | 'complete' | 'error';
  totalSlides: number;
  completedSlides: number;
  currentSlideIndex: number;
  slides: SlideProgress[];
  startedAt: number;
  completedAt?: number;
  error?: string;
}

// In-memory store — keyed by proposalId
const progressStore = new Map<number, GenerationProgress>();

export function initProgress(proposalId: number, slideTypes: { type: string; title: string }[]): GenerationProgress {
  const progress: GenerationProgress = {
    proposalId,
    status: 'generating',
    totalSlides: slideTypes.length,
    completedSlides: 0,
    currentSlideIndex: 0,
    slides: slideTypes.map((s, i) => ({
      slideIndex: i,
      slideType: s.type,
      title: s.title,
      status: 'pending',
    })),
    startedAt: Date.now(),
  };
  progressStore.set(proposalId, progress);
  return progress;
}

export function updateSlideProgress(
  proposalId: number,
  slideIndex: number,
  update: Partial<SlideProgress>
): void {
  const progress = progressStore.get(proposalId);
  if (!progress || !progress.slides[slideIndex]) return;

  Object.assign(progress.slides[slideIndex], update);

  if (update.status === 'complete') {
    progress.completedSlides = progress.slides.filter(s => s.status === 'complete').length;
  }

  // Move currentSlideIndex to next pending
  const nextPending = progress.slides.findIndex(s => s.status === 'pending' || s.status === 'generating');
  if (nextPending >= 0) {
    progress.currentSlideIndex = nextPending;
  }
}

export function setGenerationStatus(
  proposalId: number,
  status: GenerationProgress['status'],
  error?: string
): void {
  const progress = progressStore.get(proposalId);
  if (!progress) return;
  progress.status = status;
  if (error) progress.error = error;
  if (status === 'complete' || status === 'error') {
    progress.completedAt = Date.now();
  }
}

export function getProgress(proposalId: number): GenerationProgress | null {
  return progressStore.get(proposalId) || null;
}

export function clearProgress(proposalId: number): void {
  progressStore.delete(proposalId);
}

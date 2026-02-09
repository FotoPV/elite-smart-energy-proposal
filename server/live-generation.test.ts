import { describe, it, expect } from "vitest";
import {
  initProgress,
  updateSlideProgress,
  setGenerationStatus,
  getProgress,
  clearProgress,
} from "./generationProgress";

describe("Generation Progress Tracker", () => {
  const testProposalId = 99999;

  it("returns null for unknown proposal", () => {
    expect(getProgress(12345)).toBeNull();
  });

  it("initializes progress with correct slide count", () => {
    const slides = [
      { type: "cover", title: "Cover Page" },
      { type: "executive_summary", title: "Executive Summary" },
      { type: "bill_analysis", title: "Bill Analysis" },
    ];
    const progress = initProgress(testProposalId, slides);

    expect(progress.status).toBe("generating");
    expect(progress.totalSlides).toBe(3);
    expect(progress.completedSlides).toBe(0);
    expect(progress.slides).toHaveLength(3);
    expect(progress.slides[0].status).toBe("pending");
    expect(progress.slides[0].slideType).toBe("cover");
  });

  it("updates individual slide progress", () => {
    updateSlideProgress(testProposalId, 0, { status: "generating" });
    let progress = getProgress(testProposalId);
    expect(progress?.slides[0].status).toBe("generating");

    updateSlideProgress(testProposalId, 0, {
      status: "complete",
      html: "<div>Slide 1</div>",
    });
    progress = getProgress(testProposalId);
    expect(progress?.slides[0].status).toBe("complete");
    expect(progress?.slides[0].html).toBe("<div>Slide 1</div>");
    expect(progress?.completedSlides).toBe(1);
  });

  it("tracks overall generation status", () => {
    setGenerationStatus(testProposalId, "complete");
    const progress = getProgress(testProposalId);
    expect(progress?.status).toBe("complete");
    expect(progress?.completedAt).toBeDefined();
  });

  it("clears progress correctly", () => {
    clearProgress(testProposalId);
    expect(getProgress(testProposalId)).toBeNull();
  });

  it("handles error status on individual slides", () => {
    const slides = [
      { type: "cover", title: "Cover" },
      { type: "summary", title: "Summary" },
    ];
    initProgress(testProposalId + 1, slides);
    updateSlideProgress(testProposalId + 1, 1, {
      status: "error",
      error: "Template rendering failed",
    });
    const progress = getProgress(testProposalId + 1);
    expect(progress?.slides[1].status).toBe("error");
    expect(progress?.slides[1].error).toBe("Template rendering failed");
    clearProgress(testProposalId + 1);
  });
});

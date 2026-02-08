/**
 * Utilities to normalize build/deployment failures into
 * (1) a clear English summary and (2) raw/technical details text
 * suitable for display/copy/download.
 */

export interface DeploymentDiagnostics {
  summary: string;
  rawDetails: string;
}

/**
 * Normalizes an error into user-friendly summary and raw technical details.
 */
export function createDeploymentDiagnostics(error: unknown): DeploymentDiagnostics {
  let summary = 'Deployment failed';
  let rawDetails = '';

  try {
    if (error instanceof Error) {
      summary = error.message || 'Deployment failed with an error';
      rawDetails = `Error: ${error.message}\n\nStack trace:\n${error.stack || 'No stack trace available'}`;
    } else if (typeof error === 'string') {
      summary = error || 'Deployment failed';
      rawDetails = error;
    } else if (error && typeof error === 'object') {
      // Try to extract meaningful information from object
      const errorObj = error as Record<string, unknown>;
      
      if ('message' in errorObj) {
        summary = String(errorObj.message);
      }
      
      // Build raw details from all available properties
      rawDetails = JSON.stringify(error, null, 2);
      
      // If there's a stack, append it
      if ('stack' in errorObj) {
        rawDetails += `\n\nStack trace:\n${errorObj.stack}`;
      }
    } else {
      summary = 'Deployment failed with an unknown error';
      rawDetails = String(error);
    }
  } catch (stringifyError) {
    summary = 'Deployment failed';
    rawDetails = 'Unable to extract error details';
  }

  // Ensure we have some content
  if (!rawDetails) {
    rawDetails = summary;
  }

  return { summary, rawDetails };
}

/**
 * Formats diagnostics for download as a text file.
 */
export function formatDiagnosticsForDownload(diagnostics: DeploymentDiagnostics): string {
  const timestamp = new Date().toISOString();
  return `Deployment Error Report
Generated: ${timestamp}

SUMMARY:
${diagnostics.summary}

TECHNICAL DETAILS:
${diagnostics.rawDetails}
`;
}

/**
 * Triggers a download of diagnostics as a text file.
 */
export function downloadDiagnostics(diagnostics: DeploymentDiagnostics): void {
  const content = formatDiagnosticsForDownload(diagnostics);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `deployment-error-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const C = {
  blue: '#4285F4',
  green: '#34A853',
  yellow: '#FBBC04',
  red: '#EA4335',
  blue50: '#E8F0FE',
  green50: '#E6F4EA',
  yellow50: '#FEF7E0',
  red50: '#FCE8E6',
  blueDeep: '#1967D2',
  ink: '#202124',
  gray: '#5F6368',
  line: '#DADCE0',
  paper: '#F8F9FA',
  night: '#12141A',
} as const;

export type Route = 'blue' | 'green' | 'yellow' | 'red';
export const routes: { id: Route; label: string; english: string; y: number; start: number }[] = [
  { id: 'blue', label: '写代码', english: 'CODING TOOLS', y: -300, start: -1867 },
  { id: 'green', label: '日常工作', english: 'WORK AGENTS', y: -100, start: 2925 },
  { id: 'yellow', label: '提前排好步骤', english: 'WORKFLOW / BUILDER', y: 100, start: -9600 },
  { id: 'red', label: '让任务接着做', english: 'EXECUTION SUPPORT', y: 300, start: 4640 },
];
export const colors = [C.blue, C.green, C.yellow, C.red];
export const fonts = {
  sans: 'Outfit, "Noto Sans SC", sans-serif',
  chinese: '"Noto Sans SC", sans-serif',
  mono: '"JetBrains Mono", monospace',
};
export const elevation = '0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3)';

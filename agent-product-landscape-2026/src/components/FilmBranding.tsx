import { C } from '../data/theme';
import { chapterInfo } from '../lib/timeline';
import { useCinema } from '../lib/cinematics';
import { SourceLine } from './Media';

export function FilmBranding() {
  const { shot } = useCinema();
  const chapterIndex = chapterInfo.findIndex((chapter) => chapter.key === shot.chapterKey);
  const chapter = chapterInfo[chapterIndex];

  return (
    <>
      <div className="film-branding-matte" aria-hidden="true" />
      <div className="film-masthead">
        <div className="film-brand">
          <span className="brand-rule" aria-hidden="true">
            {[C.blue, C.red, '#FBBC05', C.green].map((color) => (
              <i key={color} style={{ background: color }} />
            ))}
          </span>
          <span>
            <b>PLDZ</b> / AGENT ARCHITECTURE
          </span>
          <a className="film-website" href="https://hipldz.com" target="_blank" rel="noreferrer">
            hipldz.com
          </a>
        </div>
        <span className="film-chapter">{chapter.year ? `${chapter.year}：${chapter.title}` : chapter.title}</span>
      </div>
      <div className="film-folio">
        {String(chapterIndex).padStart(2, '0')}
        <span style={{ margin: '0 12px' }}>—</span>
        AGENT PRODUCT ATLAS
      </div>
      <SourceLine shotId={shot.id} />
    </>
  );
}

/**
 * Renders Markdown to HTML (GitHub-flavoured). Kept as a standalone *sync*
 * component so react-markdown's element type doesn't clash with an async
 * Server Component's return type when used inside an async page.
 *
 * Raw HTML in the source is intentionally NOT rendered (no rehype-raw), so
 * admin/n8n-authored content can't inject markup — images/links use Markdown.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
}

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";
import "./learning.css";
import "./responsive.css";
import "./refinements.css";
import "./workspace.css";
import "./curriculum.css";
import "./experience.css";
import "./visual-lab.css";
import "./visual-focus.css";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
export const metadata = {
  title: {
    default: "raga-git — Git clicks when you can see it.",
    template: "%s | raga-git",
  },
  description:
    "Learn Git in a full-screen interactive workspace: independent remote histories, guided scenarios, real-machine practice and all 80 source interview questions.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-gray-800 group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.5)] font-semibold",
          description: "group-[.toast]:text-gray-300 font-medium",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-bold",
          cancelButton: "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

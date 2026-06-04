import { Toaster } from 'sonner';

/** Single app-wide toast host — bottom-right, max 3 stacked. */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      expand={false}
      visibleToasts={3}
      closeButton={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'p-0 border-0 bg-transparent shadow-none w-auto',
        },
      }}
      offset={{ bottom: 24, right: 24 }}
      style={{ zIndex: 200 }}
    />
  );
}

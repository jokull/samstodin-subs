import { Suspense } from "react";

import { Form } from "./_components/form";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <Suspense>
          <Form />
        </Suspense>
      </div>
    </div>
  );
}

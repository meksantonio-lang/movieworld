export async function onRequest(context: any): Promise<Response> {
  const envKeys = Object.keys(context?.env ?? {});

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Pages Function is active",
      hasMOVIEDB: Boolean(context?.env?.MOVIEDB),
      envKeys,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

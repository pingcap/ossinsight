# Widgets gateway

Serves widget images for `next.ossinsight.io` during and after the OSSInsight shutdown, so READMEs that embed a widget never show a broken image.

The widget service itself (the archived `pingcap/ossinsight-next`) is not changed. The gateway sits in front of it.

## Modes

Set with the `WIDGET_MODE` environment variable.

| Mode | When | What a widget image request returns |
| --- | --- | --- |
| `notice` (default) | Until the shutdown | The live image from the widget service with a notice bar underneath. A clean copy of the image is stored as a snapshot. If the widget service fails, the last snapshot is used. |
| `retired` | From the shutdown | The stored snapshot with a "shut down" bar underneath. Addresses without a snapshot get the bar on its own. The widget service is no longer contacted. |

Every other path is passed to the widget service by the rewrites in `vercel.json`.

## Snapshots

Snapshots are stored in Vercel Blob under `snapshots/<widget>/<base64url of the sorted query>.png`, one per distinct widget address, always the latest image. Listing the store therefore gives the list of widgets in use. The upload time of a snapshot is the date shown after the shutdown.

## Configuration

| Variable | Purpose |
| --- | --- |
| `WIDGET_MODE` | `notice` or `retired`. |
| `WIDGET_ORIGIN` | Address of the widget service. Defaults to its Vercel project address. |
| `BLOB_READ_WRITE_TOKEN` | Set by Vercel when the Blob store is connected. Without it no snapshots are written or read. |
| `SNAPSHOT_BASE_URL` | Optional. Public base URL of the Blob store, if it cannot be derived from the token. |

## Shutdown day

1. Set `WIDGET_MODE=retired` and redeploy.
2. Replace the last two rewrites in `vercel.json` with a redirect to the announcement, because the widget service will be gone.

## Deployment

The Vercel project `ossinsight-widgets-gateway` is not connected to this repository, so nothing deploys on push. Deploy from this directory with the Vercel CLI:

```sh
vercel deploy --prod
```

## Development

```sh
pnpm --filter widgets-gateway check-types
pnpm --filter widgets-gateway test
```

# CV Storage Migration Plan

## Current safety behavior

New application uploads use Cloudinary `raw` resources with `authenticated`
delivery. The server persists the Cloudinary `public_id` in `cvPublicId` and
sets the resource and delivery types. `secure_url` is not used as an API
reference. CV authorization rejects assets unless the database record says
`raw` and `authenticated`.

The migration adds canonical `cvPublicId` plus resource/delivery metadata to
applications and professional profiles. Existing application `cvId` values
are copied to `cvPublicId` because the current upload code sets `cvId` directly
to Cloudinary's `public_id`. Existing assets receive `raw`/`upload` defaults,
so they cannot be signed by the new authenticated-delivery flow. Legacy
`cvUrl` and `cvPath` columns remain intact but are no longer returned as CV
references or accepted as authorization evidence.

The implementation was checked against the installed Cloudinary Node SDK
(`cloudinary` 2.10.x): its types expose `private_download_url(publicID, format,
{ resource_type, type, expires_at, attachment })`, and its implementation
signs the expiry parameters locally. Cloudinary's official [rename API
reference](https://cloudinary.com/documentation/image_upload_api_reference_rename_public_id)
documents changing delivery type with `to_type` and CDN invalidation. The
application sends only `raw` + `authenticated` assets to the signed-download
helper. Actual account-specific feature availability and delivery behavior
remain unverified without a separate approved Cloudinary verification.

## Why no automatic asset migration script is included

The source does not prove which Cloudinary account/environment owns each
existing asset, the hostname/account relationship, the exact asset state,
whether asset identifiers are unique and current, or whether delivery-type
changes are enabled and valid for this account's raw assets. Legacy profile
`cvPath` is arbitrary caller-entered URL data, not a verified Cloudinary
public ID. Attempting to migrate those values automatically would risk changing
unrelated assets or associating the wrong file with a candidate.

## Manual-only migration procedure for a future approved operator

1. Apply and review the schema migration in a controlled environment before
   any application rollout. Do not expose legacy references to clients.
2. Obtain explicit approval, a verified Cloudinary environment identity, and
   an encrypted backup/export of the affected database rows. Never put URL,
   account, or CV data into routine logs or test output.
3. Generate a candidate manifest from `Application.cvPublicId` and verified
   database ownership relations. Include only records whose existing
   application upload path is understood. Do not infer assets from arbitrary
   URL substrings, folder-wide discovery, or the Cloudinary account inventory.
4. For each manifest row, independently verify the expected Cloudinary
   hostname/account, `resource_type=raw`, original delivery `type=upload`,
   and exact canonical `public_id`. Skip and report mismatches without making
   changes. Profile rows with only legacy `cvPath` require manual owner-assisted
   secure re-upload; do not treat their supplied URL as an asset identifier.
5. In a separate reviewed maintenance window, use Cloudinary's documented
   `rename` operation with `resource_type=raw`, `type=upload`,
   `to_type=authenticated`, and CDN invalidation enabled. Execute one
   explicitly approved manifest entry at a time; do not use account-wide
   operations. The existing public URL may remain usable in cached CDN copies
   while invalidation propagates, so keep the old delivery path considered
   exposed until independently rechecked.
6. After each confirmed successful change, update that exact database row's
   delivery metadata to `authenticated` in an approved, auditable database
   change. Do not update the row before Cloudinary confirms success. Keep the
   previous metadata and operation result securely for recovery.
7. Record only opaque row IDs, operation status, and non-sensitive error
   categories in the report. On partial failure, stop; reconcile the manifest
   against Cloudinary and database state before retrying. Do not blindly replay
   successful rename operations. Recovery must use the recorded exact prior
   type/public ID and an approved reverse operation if needed.
8. Re-test old public URLs only through an approved security process after
   CDN invalidation has propagated, and separately test the new
   time-limited authenticated download flow. Do not claim old assets are
   protected until those checks establish it.

This is a plan only. No Cloudinary API operation, database query, migration, or
asset operation was run while preparing it.

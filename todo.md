# TODOs

## In `@/`

- [x] Setup up biome organizeImport on save and similar formatting options.

## In `@docs/decisions`

- [ ] Do a Back-of-envelop Estimation on 10K MAU in `back-of-envelope.md`. [Ref: Back-of-the-envelope Estimation](https://bytebytego.com/courses/system-design-interview/back-of-the-envelope-estimation)

## In `@package/auth`

- [ ] Add correct schema in `@package/auth/schema.ts` and custom column called timezone in `@package/auth/auth-schema.ts` users table which will be done in `@package/auth/src/auth.ts`.
- [ ] Writing e2e test for testing auth.

## In `@package/db`

- [x] Complete schema/schema.ts and db:push.
- [ ] Writing e2e to test db connection and seeding data.

## In `@apps/api`

- [x] Setting up nestjs project.
- [x] Give a read: [https://docs.nestjs.com/cli/monorepo](https://docs.nestjs.com/cli/monorepo)
- [ ] Figure out what happens with tsconfig.json because theirs a tsconfig.base.json in root.
- [ ] endpoint design and most of it part is yet to be done. (Refer: docs/overview.canvas)
- [ ] In habits, add checks for same info getting added to the db multiple times.
- [ ] Add column in habit table in db, archive that takes boolean right now it has archived_at column.
- [ ] Add Dockerfile and docker-compose file and prepare backend for cloud deployment. (api.mosaic.iamadi.xyz).

## In `@apps/mobile`

## In `@package/mobile-ui`

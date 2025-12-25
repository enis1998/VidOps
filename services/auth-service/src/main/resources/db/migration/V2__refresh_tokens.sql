create table if not exists refresh_tokens (
                                              id uuid primary key,
                                              user_id uuid not null,
                                              token_hash varchar(64) not null unique,
    expires_at timestamptz not null,
    revoked_at timestamptz null,
    replaced_by_hash varchar(64) null,
    created_at timestamptz not null,
    constraint fk_refresh_user foreign key (user_id) references auth_users(id) on delete cascade
    );

create index if not exists idx_refresh_tokens_user on refresh_tokens(user_id);

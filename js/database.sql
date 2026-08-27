create table orders (
    id bigint generated always as identity primary key,

    dashboard text not null,
    nomor_pesanan text not null,

    tagar text not null,

    nomor_whatsapp text,

    paket_total integer not null,
    paket_terkirim integer default 0,

    last_check_utc text default '',

    keterangan text default '',

    created_at timestamptz default now()
);

alter table orders enable row level security;

create policy "public_select"
on orders
for select
using (true);

create policy "public_insert"
on orders
for insert
with check (true);

create policy "public_update"
on orders
for update
using (true);

create policy "public_delete"
on orders
for delete
using (true);

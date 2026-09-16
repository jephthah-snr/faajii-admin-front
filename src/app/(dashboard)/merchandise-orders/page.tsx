"use client";

import {useState} from 'react';
import {Badge, Drawer, Group, Select, Stack, Table, Text, TextInput, Title} from '@mantine/core';
import {useDebouncedValue} from '@mantine/hooks';
import {useQuery} from '@tanstack/react-query';
import {AppLayout} from '@/layout';
import {getAdminMerchandiseOrder, getAdminMerchandiseOrders, type AdminMerchandiseOrder, type AdminMerchandiseOrderDetail} from '@/services/api';

const money = (amount: number, currency: string) => new Intl.NumberFormat('en', {style: 'currency', currency, maximumFractionDigits: 2}).format(amount);
const statusColor = (status: string) => status === 'completed' ? 'teal' : status === 'fulfilled' ? 'blue' : status === 'pending' ? 'yellow' : 'gray';

export default function MerchandiseOrdersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const ordersQuery = useQuery({queryKey: ['admin-merchandise-orders', debouncedSearch, status], queryFn: () => getAdminMerchandiseOrders({page: 1, limit: 50, search: debouncedSearch || undefined, status: status || undefined})});
  const detailQuery = useQuery({queryKey: ['admin-merchandise-order', selectedId], queryFn: () => getAdminMerchandiseOrder(selectedId!), enabled: selectedId != null});
  const orders: AdminMerchandiseOrder[] = ordersQuery.data?.data?.data?.data ?? [];
  const detail: AdminMerchandiseOrderDetail | null = detailQuery.data?.data?.data ?? null;

  return <AppLayout>
    <Stack gap="lg">
      <div><Title order={2}>Merchandise Orders</Title><Text c="dimmed">Physical-item orders, delivery details, payment references and fulfilment progress.</Text></div>
      <Group><TextInput placeholder="Search reference, buyer or event" value={search} onChange={e => setSearch(e.currentTarget.value)} w={320}/><Select placeholder="All statuses" clearable value={status} onChange={setStatus} data={['pending', 'fulfilled', 'completed', 'cancelled']}/></Group>
      <Table striped highlightOnHover withTableBorder><Table.Thead><Table.Tr><Table.Th>Order</Table.Th><Table.Th>Event</Table.Th><Table.Th>Buyer</Table.Th><Table.Th>Delivery</Table.Th><Table.Th>Status</Table.Th><Table.Th>Paid</Table.Th></Table.Tr></Table.Thead><Table.Tbody>
        {orders.map(order => <Table.Tr key={order.id} style={{cursor: 'pointer'}} onClick={() => setSelectedId(order.id)}><Table.Td>{order.orderReference}<Text size="xs" c="dimmed">{order.checkoutReference}</Text></Table.Td><Table.Td>{order.eventName || 'Deleted event'}</Table.Td><Table.Td>{order.buyer.name || '—'}<Text size="xs" c="dimmed">{order.buyer.email}</Text></Table.Td><Table.Td>{order.buyer.deliveryPhone}<Text size="xs" c="dimmed" lineClamp={1}>{order.buyer.deliveryAddress}</Text></Table.Td><Table.Td><Badge color={statusColor(order.status)}>{order.status}</Badge></Table.Td><Table.Td>{order.paidAt ? new Date(order.paidAt).toLocaleString() : '—'}</Table.Td></Table.Tr>)}
      </Table.Tbody></Table>
    </Stack>
    <Drawer opened={selectedId != null} onClose={() => setSelectedId(null)} title="Merchandise order" position="right" size="lg">
      {detail ? <Stack><Title order={4}>{detail.orderReference}</Title><Text><b>Event:</b> {detail.eventName}</Text><Text><b>Checkout:</b> {detail.checkoutReference}</Text><Text><b>Buyer:</b> {detail.buyer.name} · {detail.buyer.email}</Text><Text><b>Payment phone:</b> {detail.buyer.paymentPhone || '—'}</Text><Text><b>Delivery:</b> {detail.buyer.deliveryPhone}<br/>{detail.buyer.deliveryAddress}</Text><Badge color={statusColor(detail.status)}>{detail.status}</Badge><Title order={5}>Items</Title>{detail.items.map(item => <Group key={item.id} justify="space-between"><Text>{item.quantity} × {item.name}</Text><Text>{money(item.lineTotal, detail.currency)}</Text></Group>)}</Stack> : <Text>Loading order…</Text>}
    </Drawer>
  </AppLayout>;
}

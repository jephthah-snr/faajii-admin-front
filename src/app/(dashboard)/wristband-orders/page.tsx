"use client";

import {useState} from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Flex,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {useDebouncedValue} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AppLayout} from '@/layout';
import {
  GetAdminWristbandOrder,
  GetAdminWristbandOrders,
  GetAdminWristbandStatistics,
  ReconcileAdminWristbandPayment,
  UpdateAdminWristbandFulfillment,
} from '@/services/api';
import type {
  AdminWristbandOrder,
  WristbandOrderStatus,
  WristbandPaymentState,
} from '@/services/api/wristbands/wristband.types';

const STATUS_OPTIONS: Array<{value: WristbandOrderStatus; label: string}> = [
  {value: 'pending_payment', label: 'Pending payment'},
  {value: 'payment_failed', label: 'Payment failed'},
  {value: 'placed', label: 'Placed'},
  {value: 'in_production', label: 'In production'},
  {value: 'quality_check', label: 'Quality check'},
  {value: 'shipped', label: 'Shipped'},
  {value: 'delivered', label: 'Delivered'},
  {value: 'cancelled', label: 'Cancelled'},
];

const NEXT_STATUS: Partial<Record<WristbandOrderStatus, Array<{value: string; label: string}>>> = {
  placed: [{value: 'in_production', label: 'Start production'}],
  in_production: [{value: 'quality_check', label: 'Move to quality check'}],
  quality_check: [{value: 'shipped', label: 'Mark as shipped'}],
  shipped: [{value: 'delivered', label: 'Mark as delivered'}],
};

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en', {style: 'currency', currency, maximumFractionDigits: 2}).format(amount);
}

function statusColor(status: string) {
  if (['placed', 'delivered'].includes(status)) return 'teal';
  if (['in_production', 'quality_check', 'shipped'].includes(status)) return 'blue';
  if (status === 'pending_payment') return 'yellow';
  if (status === 'payment_failed') return 'red';
  return 'gray';
}

export default function WristbandOrdersPage() {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [status, setStatus] = useState<WristbandOrderStatus>();
  const [paymentState, setPaymentState] = useState<WristbandPaymentState>();
  const [selected, setSelected] = useState<AdminWristbandOrder | null>(null);
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [fulfillmentNote, setFulfillmentNote] = useState('');
  const [providerReference, setProviderReference] = useState('');
  const [confirmedAmount, setConfirmedAmount] = useState<number | string>('');
  const [reconciliationNote, setReconciliationNote] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['admin-wristband-orders', page, debouncedSearch, status, paymentState],
    queryFn: () => GetAdminWristbandOrders({page, limit: 20, search: debouncedSearch || undefined, status, paymentState}),
  });
  const statsQuery = useQuery({queryKey: ['admin-wristband-statistics'], queryFn: GetAdminWristbandStatistics});
  const detailQuery = useQuery({
    queryKey: ['admin-wristband-order', selected?.id],
    queryFn: () => GetAdminWristbandOrder(selected!.id),
    enabled: selected != null,
  });
  const detail = detailQuery.data?.data;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({queryKey: ['admin-wristband-orders']}),
      queryClient.invalidateQueries({queryKey: ['admin-wristband-statistics']}),
      queryClient.invalidateQueries({queryKey: ['admin-wristband-order', selected?.id]}),
    ]);
  };

  const fulfillmentMutation = useMutation({
    mutationFn: () => UpdateAdminWristbandFulfillment(selected!.id, {
      status: nextStatus as 'in_production' | 'quality_check' | 'shipped' | 'delivered',
      carrier: carrier.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      note: fulfillmentNote.trim() || undefined,
    }),
    onSuccess: async () => {
      notifications.show({title: 'Order updated', message: 'Fulfillment status and audit history were updated.', color: 'teal'});
      setNextStatus(null); setFulfillmentNote(''); await refresh();
    },
    onError: (error: any) => notifications.show({title: 'Update failed', message: error?.response?.data?.message || error.message, color: 'red'}),
  });

  const reconcileMutation = useMutation({
    mutationFn: () => ReconcileAdminWristbandPayment(selected!.id, {
      providerReference: providerReference.trim() || undefined,
      amount: typeof confirmedAmount === 'number' ? confirmedAmount : undefined,
      note: reconciliationNote.trim() || undefined,
    }),
    onSuccess: async () => {
      notifications.show({title: 'Payment reconciled', message: 'The order is paid and ready for fulfillment.', color: 'teal'});
      setProviderReference(''); setConfirmedAmount(''); setReconciliationNote(''); await refresh();
    },
    onError: (error: any) => notifications.show({title: 'Reconciliation failed', message: error?.response?.data?.message || error.message, color: 'red'}),
  });

  const statistics = statsQuery.data?.data;
  const orders = ordersQuery.data?.data.data || [];
  const canReconcile = detail && ['pending_payment', 'payment_failed'].includes(detail.status);
  const transitionOptions = detail ? NEXT_STATUS[detail.status] || [] : [];

  return (
    <AppLayout title="Wristband Orders" subTitle="Payments, production fulfillment, delivery tracking, and reconciliation.">
      <SimpleGrid cols={{base: 1, sm: 2, lg: 4}} mb="xl">
        <Card withBorder radius="lg"><Text c="dimmed" fz="sm">Needs reconciliation</Text><Text fw={700} fz={28}>{statistics?.pendingReconciliation || 0}</Text></Card>
        {(statistics?.paid || []).map(total => <Card key={total.currency} withBorder radius="lg"><Text c="dimmed" fz="sm">Paid volume · {total.currency}</Text><Text fw={700} fz={24}>{money(total.amount, total.currency)}</Text><Text c="dimmed" fz="xs">{total.orders} orders</Text></Card>)}
        <Card withBorder radius="lg"><Text c="dimmed" fz="sm">In production</Text><Text fw={700} fz={28}>{statistics?.byStatus.find(row => row.status === 'in_production')?.orders || 0}</Text></Card>
      </SimpleGrid>

      <Flex gap="md" mb="lg" wrap="wrap">
        <TextInput placeholder="Search order, provider ref, event, or customer" value={search} onChange={event => setSearch(event.currentTarget.value)} w={{base: '100%', md: 360}} />
        <Select placeholder="All order statuses" clearable data={STATUS_OPTIONS} value={status} onChange={value => setStatus((value || undefined) as WristbandOrderStatus | undefined)} w={210} />
        <Select placeholder="All payment states" clearable data={[{value: 'paid', label: 'Paid'}, {value: 'pending', label: 'Pending'}, {value: 'failed', label: 'Failed'}]} value={paymentState} onChange={value => setPaymentState((value || undefined) as WristbandPaymentState | undefined)} w={190} />
      </Flex>

      <Card withBorder radius="lg" padding={0}>
        <Table.ScrollContainer minWidth={1050}>
          <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead><Table.Tr><Table.Th>Reference</Table.Th><Table.Th>Event</Table.Th><Table.Th>Customer</Table.Th><Table.Th>Bands</Table.Th><Table.Th>Amount</Table.Th><Table.Th>Payment</Table.Th><Table.Th>Fulfillment</Table.Th><Table.Th>Date</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>{orders.map(order => <Table.Tr key={order.id} onClick={() => setSelected(order)} style={{cursor: 'pointer'}}>
              <Table.Td><Text fw={600}>{order.reference}</Text><Text c="dimmed" fz="xs">{order.paymentProviderRef || 'No provider reference'}</Text></Table.Td>
              <Table.Td><Text fw={600}>{order.eventName}</Text><Text c="dimmed" fz="xs">{order.eventRef}</Text></Table.Td>
              <Table.Td><Text>{order.customerName}</Text><Text c="dimmed" fz="xs">{order.customerEmail}</Text></Table.Td>
              <Table.Td>{order.totalQuantity}</Table.Td><Table.Td>{money(order.amount, order.currency)}</Table.Td>
              <Table.Td><Badge color={order.paymentState === 'paid' ? 'teal' : order.paymentState === 'failed' ? 'red' : 'yellow'}>{order.paymentState}</Badge><Text c="dimmed" fz="xs">{order.paymentMethod}</Text></Table.Td>
              <Table.Td><Badge color={statusColor(order.status)}>{STATUS_OPTIONS.find(item => item.value === order.status)?.label || order.status}</Badge></Table.Td>
              <Table.Td>{new Intl.DateTimeFormat('en', {dateStyle: 'medium'}).format(new Date(order.createdAt))}</Table.Td>
            </Table.Tr>)}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {!ordersQuery.isLoading && orders.length === 0 && <Group justify="center" p="xl"><Text c="dimmed">No wristband orders match these filters.</Text></Group>}
      </Card>

      <Drawer opened={selected != null} onClose={() => setSelected(null)} position="right" size="xl" title={detail ? `Order ${detail.reference}` : 'Wristband order'}>
        {detailQuery.isLoading ? <Text>Loading order…</Text> : detail ? <Stack gap="lg">
          <SimpleGrid cols={2}><Card withBorder><Text c="dimmed" fz="xs">Payment</Text><Badge color={detail.paymentState === 'paid' ? 'teal' : 'yellow'}>{detail.paymentState}</Badge><Text mt="xs">{money(detail.amount, detail.currency)}</Text></Card><Card withBorder><Text c="dimmed" fz="xs">Fulfillment</Text><Badge color={statusColor(detail.status)}>{detail.status}</Badge><Text mt="xs">{detail.totalQuantity} bands</Text></Card></SimpleGrid>
          <Card withBorder><Text fw={700}>Customer and event</Text><Text mt="sm">{detail.customerName} · {detail.customerEmail}</Text><Text>{detail.eventName} · {detail.eventRef}</Text><Text c="dimmed" fz="sm">Provider reference: {detail.paymentProviderRef || 'Not recorded'}</Text></Card>

          <Card withBorder><Text fw={700} mb="sm">Order items</Text>{detail.items.map(item => <Group key={item.id} justify="space-between" py="xs"><div><Text fw={600}>{item.productName}</Text><Text c="dimmed" fz="xs">{item.quantity} × {money(item.unitPrice, detail.currency)} · {item.color}</Text></div><Button component="a" href={item.designSourceUrl || item.designUrl} target="_blank" variant="light" size="xs">Artwork</Button></Group>)}</Card>

          {transitionOptions.length > 0 && <Card withBorder><Text fw={700}>Update fulfillment</Text><Select mt="sm" placeholder="Choose next status" data={transitionOptions} value={nextStatus} onChange={setNextStatus} /><Group grow mt="sm"><TextInput placeholder="Carrier" value={carrier} onChange={e => setCarrier(e.currentTarget.value)} /><TextInput placeholder="Tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.currentTarget.value)} /></Group><Textarea mt="sm" placeholder="Internal fulfillment note" value={fulfillmentNote} onChange={e => setFulfillmentNote(e.currentTarget.value)} /><Button mt="md" disabled={!nextStatus || (nextStatus === 'shipped' && !trackingNumber.trim())} loading={fulfillmentMutation.isPending} onClick={() => fulfillmentMutation.mutate()}>Save fulfillment update</Button></Card>}

          {canReconcile && <Card withBorder style={{borderColor: '#e67700'}}><Text fw={700}>Reconcile payment</Text><Text c="dimmed" fz="sm">Wallet/purse orders are verified automatically. Manual external reconciliation requires a super admin, exact amount, provider reference, and audit note.</Text><TextInput mt="sm" placeholder="Provider transaction reference" value={providerReference} onChange={e => setProviderReference(e.currentTarget.value)} /><NumberInput mt="sm" placeholder={`Confirmed amount (${detail.currency})`} value={confirmedAmount} onChange={setConfirmedAmount} min={0} /><Textarea mt="sm" placeholder="Where and how was this payment independently confirmed?" value={reconciliationNote} onChange={e => setReconciliationNote(e.currentTarget.value)} /><Button color="orange" mt="md" loading={reconcileMutation.isPending} onClick={() => reconcileMutation.mutate()}>Verify and reconcile</Button></Card>}

          <Divider /><div><Text fw={700} mb="sm">Audit history</Text>{detail.history.length === 0 ? <Text c="dimmed">No admin actions yet.</Text> : detail.history.map(entry => <Card key={entry.id} withBorder mb="xs"><Group justify="space-between"><Text fw={600}>{entry.action.replaceAll('_', ' ')}</Text><Text c="dimmed" fz="xs">{new Date(entry.createdAt).toLocaleString()}</Text></Group><Text fz="sm">{entry.fromStatus || '—'} → {entry.toStatus || '—'}</Text>{entry.note && <Text c="dimmed" fz="sm">{entry.note}</Text>}</Card>)}</div>
        </Stack> : <Text>Order not found.</Text>}
      </Drawer>
    </AppLayout>
  );
}

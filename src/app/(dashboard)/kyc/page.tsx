"use client";

import { Anchor, Avatar, Badge, Button, Divider, Group, Image, Modal, Stack, Table, Text, Textarea } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { AppLayout } from "@/layout";
import { PpTable, StatBar } from "@/components";
import { ApproveKycPart, DeclineKycPart, GetKycStats, GetKycSubmission, GetKycSubmissions } from "@/services/api";
import type { KycPartStatus, KycReviewStatus, KycSubmission, KycSubmissionDetail } from "@/services/api/kyc/kyc.types";
import { asList, formatDateTime, getApiErrorMessage, rowsPerPage } from "@/utils";

const color: Record<KycPartStatus | KycReviewStatus, string> = { pending: "yellow", verified: "teal", rejected: "red", incomplete: "gray", not_started: "gray" };
const headers = ["Applicant", "Document", "Identity", "Selfie", "Overall status", "Submitted"];

export default function KycPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [selected, setSelected] = useState<KycSubmissionDetail | null>(null);
  const [declining, setDeclining] = useState<"identity" | "selfie" | null>(null);
  const [reason, setReason] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const list = useQuery({ queryKey: ["admin-kyc", page, debouncedSearch], queryFn: () => GetKycSubmissions({ page, limit: rowsPerPage, search: debouncedSearch || undefined }) });
  const stats = useQuery({ queryKey: ["admin-kyc-stats"], queryFn: GetKycStats });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ["admin-kyc"] }); queryClient.invalidateQueries({ queryKey: ["admin-kyc-stats"] }); };
  const decision = useMutation({
    mutationFn: ({ part, approve }: { part: "identity" | "selfie"; approve: boolean }) => {
      if (!selected) throw new Error("No KYC submission selected");
      return approve ? ApproveKycPart(selected.userId, part) : DeclineKycPart(selected.userId, part, reason.trim());
    },
    onSuccess: (response) => { setSelected(response?.data || null); setDeclining(null); setReason(""); refresh(); notifications.show({ color: "teal", message: "KYC review saved" }); },
    onError: (error) => notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });
  const openDetail = async (submission: KycSubmission) => {
    try { const response = await GetKycSubmission(submission.userId); setSelected(response.data); open(); }
    catch (error) { notifications.show({ color: "red", message: getApiErrorMessage(error) }); }
  };
  const submissions = asList(list.data?.data?.data);
  const rows = submissions.map((item) => <Table.Tr key={item.userId} className="cursor-pointer" onClick={() => openDetail(item)}>
    <Table.Td><Group gap="sm"><Avatar src={item.user.avatar} name={item.user.fullname} size="sm" /><Stack gap={0}><Text fw={600}>{item.user.fullname}</Text><Text fz="xs" c="var(--fj-text-muted)">{item.user.email}</Text></Stack></Group></Table.Td>
    <Table.Td><Text fz="sm">{item.documentType || "Not submitted"}</Text><Text fz="xs" c="var(--fj-text-muted)">{item.countryIso || "—"}</Text></Table.Td>
    <Table.Td><Badge color={color[item.identity.status]} variant="light">{item.identity.status}</Badge></Table.Td>
    <Table.Td><Badge color={color[item.selfie.status]} variant="light">{item.selfie.status}</Badge></Table.Td>
    <Table.Td><Badge color={color[item.status]} variant="light">{item.status}</Badge></Table.Td>
    <Table.Td>{item.identity.submittedAt || item.selfie.submittedAt ? formatDateTime(item.identity.submittedAt || item.selfie.submittedAt!) : "—"}</Table.Td>
  </Table.Tr>);
  const kycStats = stats.data?.data;
  const part = (name: "identity" | "selfie", status: KycPartStatus, title: string, image?: string | null) => <Stack gap="sm" p="md" style={{ border: "1px solid var(--fj-border-subtle)", borderRadius: 12 }}>
    <Group justify="space-between"><Text fw={700}>{title}</Text><Badge color={color[status]} variant="light">{status}</Badge></Group>
    {image ? <Image src={image} alt={`${title} evidence`} radius="sm" maw={360} fit="contain" /> : <Text fz="sm" c="var(--fj-text-muted)">No image was submitted for this verification type.</Text>}
    {selected?.[name].reason && <Text fz="sm" c="red">Decline reason: {selected[name].reason}</Text>}
    {status === "pending" && (declining === name ? <Stack><Textarea value={reason} onChange={(event) => setReason(event.currentTarget.value)} label="Reason for decline" description="This will be shown to the applicant." minRows={2} /><Group justify="flex-end"><Button variant="subtle" onClick={() => setDeclining(null)}>Cancel</Button><Button color="red" disabled={reason.trim().length < 3} loading={decision.isPending} onClick={() => decision.mutate({ part: name, approve: false })}>Confirm decline</Button></Group></Stack> : <Group justify="flex-end"><Button variant="light" color="red" onClick={() => setDeclining(name)}>Decline…</Button><Button color="teal" loading={decision.isPending} onClick={() => decision.mutate({ part: name, approve: true })}>Approve {title.toLowerCase()}</Button></Group>)}
  </Stack>;
  return <AppLayout title="KYC reviews" subTitle="Review submitted identity documents and selfies securely">
    <Stack gap="xl">
      {kycStats && <StatBar items={[{ label: "Awaiting review", value: kycStats.pending }, { label: "Verified", value: kycStats.verified }, { label: "Declined", value: kycStats.rejected }, { label: "Incomplete", value: kycStats.incomplete }]} />}
      <PpTable headers={headers} rowData={rows} totalItems={list.data?.data?.pagination?.total || 0} activePage={page} setActivePage={setPage} rowsPerPage={rowsPerPage} isLoading={list.isFetching} hasActions query={search} handleQuery={(value) => { setSearch(value); setPage(1); }} searchPlaceholder="Search name, email or phone" emptyState={{ title: "No KYC submissions", description: "Submitted identity documents and selfies will appear here." }} />
    </Stack>
    <Modal opened={opened} onClose={close} title="KYC review" size="xl" centered>
      {selected && <Stack gap="lg"><Group><Avatar src={selected.user.avatar} name={selected.user.fullname} size={52} /><Stack gap={0}><Text fw={700}>{selected.user.fullname}</Text><Anchor href={`/user-management/${selected.userId}`}>{selected.user.email}</Anchor><Text fz="xs" c="var(--fj-text-muted)">{selected.user.phoneNumber}</Text></Stack></Group><Text fz="sm" c="var(--fj-text-muted)">Document: {selected.documentType || "—"} · Country: {selected.countryIso || "—"} · Number: {selected.documentNumber || "—"}</Text><Divider />{part("identity", selected.identity.status, "Identity document", selected.evidence.documentFrontUrl)}{selected.evidence.documentBackUrl && <Image src={selected.evidence.documentBackUrl} alt="Back of identity document" radius="sm" maw={360} fit="contain" />}{part("selfie", selected.selfie.status, "Selfie", selected.evidence.selfieUrl)}</Stack>}
    </Modal>
  </AppLayout>;
}

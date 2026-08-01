export const getStatusColor = (data: string) => {
  switch (data) {
    case "active":
    case "complete":
    case "completed":
    case "successful":
    case "available":
    case "verified":
    case "approved":
    case "delivered":
    case "paid":
      return "#4AA785";
    case "pending":
    case "processing":
    case "upcoming":
    case "outofstock":
    case "medium":
    case "intransit":
      return "#FFC555";
    case "deactivated":
    case "cancelled":
    case "inactive":
    case "failed":
    case "high":
    case "unverified":
    case "disapproved":
      return "#ED4245";
    case "invited":
    case "gifts":
    case "superadmin":
    case "admin":
      return "#5FD2ED";
    case "confirmed":
    case "customersupport":
      return "#FF9900";
    case "products":
      return "#27A07F";
    case "services":
      return "#EFCA79";
    case "ticket":
      return "#BA7D22";
    case "expectinggift":
      return "#F8F8F8";
    case "giftingstarted":
      return "#FFFF00";
    case "gifted":
      return "#10B980";

    case "operations":
      return "#F44E80";
    case "customrole1":
      return "#B011EA";

    default:
      return "#FFFFFF66";
  }
};

export const getStatusColorAlt = (data: string, isTransaction?: boolean) => {
  if (isTransaction) {
    switch (data) {
      case "successful":
      case "completed":
      case "paid":
        return "#42AA4E";
      case "inprogress":
      case "pending":
        return "#F6750B";
      case "failed":
      case "cancelled":
        return "#F63F00";
      default:
        return "#FFFFFF66";
    }
  }

  // General status colors
  switch (data) {
    case "all":
      return "#FFFFFF";
    case "confirmed":
      return "#24A181";
    case "inprogress":
    case "pending":
      return "#FFC555";
    case "completed":
    case "delivered":
      return "#4AA785";
    case "outfordelivery":
    case "shipped":
      return "#CFB1FF";
    case "cancelled":
    case "failed":
      return "#ED4245";
    case "noshow":
      return "#F63F00";
    case "refunded":
      return "#FF7C25";
    case "infulfilment":
    case "processing":
      return "#F600A8";
    case "paid":
      return "#52DFFF";
    case "convertedtocash":
      return "#848484";

    case "active":
      return "#25AD32";
    case "invited":
      return "#5FD2ED";
    case "suspended":
      return "#ED5FC2";

    default:
      return "#FFFFFF66";
  }
};

import html2canvas from "html2canvas";
import { convertToNaira, formatStringAmount } from "./valueFormatter";
import { TransactionDetails } from "@/services/api/transaction/transaction.types";
import { getStatusColorAlt } from "./getStatusColor";
import { Edges } from "@/services/api/event/event.types";

export const generateReceipt = async (transaction: TransactionDetails) => {
  // Create a temporary container for the receipt
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "420px"; // Receipt width
  document.body.appendChild(container);

  const isPvb = transaction?.reference?.startsWith("PVB");

  // Format the amount
  const formattedAmount = isPvb
    ? formatStringAmount(
        convertToNaira(transaction?.transactionAmount || 0) || "0.00"
      )
    : formatStringAmount(transaction?.transactionAmount);

  const formattedDate = new Date(transaction.created_at).toLocaleString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );

  // Set the receipt HTML content
  container.innerHTML = `
  <div style="padding: 14px;">
    <div
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-top: 8px;
      "
    >
      <div
        style="
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #868686;
        "
      >
        <span>Receipt</span>
      </div>

      <img
        src="https://res.cloudinary.com/dgyoeesf4/image/upload/v1759422453/pv_logo_k4eah8.svg"
        alt="logo"
        width="100"
        height="100"
      />
    </div>

    <div
      style="
        display: flex;
        flex-direction: column;
        background-color: #121212;
        padding: 20px;
        gap: 40px;
        border-radius: 12px;
        border: 2px dashed #515151;
        margin-top: 20px;
      "
    >
      <!-- Amount and Status -->
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        "
      >
        <div
          style="
            font-size: 24px;
            font-weight: 500;
            color: #fff;
          "
        >
          ₦${formattedAmount}
        </div>

        <div
          style="
            padding: 6px 22px;
            padding-bottom: 12px;
            border-radius: 50px;
            background-color: ${getStatusColorAlt(
              transaction.transactionStatus,
              true
            )};
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <span
              style="
                color: #fff;
                font-size: 14px;
                text-transform: capitalize;
                margin-top: -10px;
              "
            >
              ${transaction.transactionStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Date -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Date</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">
            ${formattedDate}
          </div>
        </div>

        <!-- Sender -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Sender</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">N/A</div>
        </div>

        <!-- Sender Bank -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Sender bank</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">N/A</div>
        </div>

        <!-- Recipient -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Recipient</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">
            ${transaction.destination.accountName || "N/A"}
          </div>
        </div>

        <!-- Description -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Description</div>
          <div
            style="
              font-size: 14px;
              color: #fff;
              text-align: right;
              max-width: 60%;
              word-break: break-all; 
              overflow-wrap: anywhere;
            "
          >
            ${transaction.narration || "N/A"}
          </div>
        </div>

        <!-- Transaction Type -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Transaction Type</div>
          <div style="font-size: 14px; color: #fff; text-align: right;">
            ${transaction.transactionType || "N/A"}
          </div>
        </div>

        <!-- Reference -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Reference</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">
            ${transaction.reference || "N/A"}
          </div>
        </div>

        <!-- Session ID -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Session ID</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">${
            transaction?.metaData?.session_id || "N/A"
          }</div>
        </div>
      </div>
    </div>
  </div>
`;

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: "#000000",
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Failed to generate image");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trx-receipt-${transaction.transactionRef.replace(
        "#",
        ""
      )}.png`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  } finally {
    // Remove the temporary container
    document.body.removeChild(container);
  }
};

export const generateReceipt2 = async (transaction: Edges) => {
  // Create a temporary container for the receipt
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "420px"; // Receipt width
  document.body.appendChild(container);

  // Format the amount
  const amount = convertToNaira(transaction.amount || 0);
  const formattedAmount = formatStringAmount(amount || "0.00");
  const formattedDate = new Date(transaction.created_at).toLocaleString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );

  // Set the receipt HTML content
  container.innerHTML = `
  <div style="padding: 14px;">
    <div
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-top: 8px;
      "
    >
      <div
        style="
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #868686;
        "
      >
        <span>Receipt</span>
      </div>

      <img
        src="https://res.cloudinary.com/dgyoeesf4/image/upload/v1759422453/pv_logo_k4eah8.svg"
        alt="logo"
        width="100"
        height="100"
      />
    </div>

    <div
      style="
        display: flex;
        flex-direction: column;
        background-color: #121212;
        padding: 20px;
        gap: 40px;
        border-radius: 12px;
        border: 2px dashed #515151;
        margin-top: 20px;
      "
    >
      <!-- Amount and Status -->
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        "
      >
        <div
          style="
            font-size: 24px;
            font-weight: 500;
            color: #fff;
          "
        >
          ₦${formattedAmount}
        </div>

        <div
          style="
            padding: 6px 22px;
            padding-bottom: 12px;
            border-radius: 50px;
            background-color: ${getStatusColorAlt(transaction.status, true)};
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <span
              style="
                color: #fff;
                font-size: 14px;
                text-transform: capitalize;
                margin-top: -10px;
              "
            >
              ${transaction.status}
            </span>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <!-- Date -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Date</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">
            ${formattedDate}
          </div>
        </div>

        <!-- Sender -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Sender</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">${
            transaction.meta?.source_name || "N/A"
          }</div>
        </div>

        <!-- Sender Bank -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Sender bank</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">${
            transaction.meta?.source_bank_name || "N/A"
          }</div>
        </div>

        <!-- Recipient -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Recipient</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">
            ${transaction.meta?.destination_name || "N/A"}
          </div>
        </div>

        <!-- Description -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Description</div>
          <div
            style="
              font-size: 14px;
              color: #fff;
              text-align: right;
              max-width: 60%;
              word-break: break-all;
              overflow-wrap: anywhere;
            "
          >
            ${transaction.description || "N/A"}
          </div>
        </div>

        <!-- Transaction Type -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Transaction Type</div>
          <div style="font-size: 14px; color: #fff; text-align: right;">
            ${transaction.category || "N/A"}
          </div>
        </div>

        <!-- Reference -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Reference</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">
            ${transaction.id || "N/A"}
          </div>
        </div>

        <!-- Session ID -->
        <div style="display: flex; justify-content: space-between; gap: 14px;">
          <div style="font-size: 13px; color: #969696;">Session ID</div>
          <div style="font-size: 14px; color: #fff; text-align: right; word-break: break-all; overflow-wrap: anywhere;">${
            transaction.session_id || "N/A"
          }</div>
        </div>
      </div>
    </div>
  </div>
`;

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: "#000000",
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Failed to generate image");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trx-receipt-${transaction.id.replace("#", "")}.png`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  } finally {
    // Remove the temporary container
    document.body.removeChild(container);
  }
};

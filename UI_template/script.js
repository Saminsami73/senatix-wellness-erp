import React, { useEffect, useRef, useState } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (Lucide-style, 24x24, stroke-based)              */
/*  Replaces the lucide-react dependency. Supports className and      */
/*  strokeWidth props just like lucide-react did.                     */
/* ------------------------------------------------------------------ */

function BaseIcon({ className = "", strokeWidth = 2, children, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

const makeIcon = (children) => (props) => <BaseIcon {...props}>{children}</BaseIcon>;

const BellIcon = makeIcon(
  <>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </>
);

const BoomBoxIcon = makeIcon(
  <>
    <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M8 8v1" />
    <path d="M12 8v1" />
    <path d="M16 8v1" />
    <rect width="20" height="12" x="2" y="9" rx="2" />
    <circle cx="8" cy="15" r="2" />
    <circle cx="16" cy="15" r="2" />
  </>
);

const ChartColumnBigIcon = makeIcon(
  <>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <rect x="15" y="5" width="4" height="12" rx="1" />
    <rect x="7" y="8" width="4" height="9" rx="1" />
  </>
);

const ChartPieIcon = makeIcon(
  <>
    <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
  </>
);

const ChevronLeftIcon = makeIcon(<path d="m15 18-6-6 6-6" />);

const ChevronRightIcon = makeIcon(<path d="m9 18 6-6-6-6" />);

const CirclePlusIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </>
);

const ClockIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

const EllipsisIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </>
);

const EllipsisVerticalIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>
);

const EyeIcon = makeIcon(
  <>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </>
);

const FileIcon = makeIcon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </>
);

const FlameIcon = makeIcon(
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
);

const GiftIcon = makeIcon(
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </>
);

const HeadsetIcon = makeIcon(
  <>
    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
  </>
);

const LayoutDashboardIcon = makeIcon(
  <>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </>
);

const MailIcon = makeIcon(
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>
);

const MessageSquareTextIcon = makeIcon(
  <>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M13 8H7" />
    <path d="M17 12H7" />
  </>
);

const PinIcon = makeIcon(
  <>
    <path d="M12 17v5" />
    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
  </>
);

const RssIcon = makeIcon(
  <>
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" />
  </>
);

const SettingsIcon = makeIcon(
  <>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

const ShoppingBag = makeIcon(
  <>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </>
);

const ShoppingBasketIcon = makeIcon(
  <>
    <path d="m15 11-1 9" />
    <path d="m19 11-4-7" />
    <path d="M2 11h20" />
    <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
    <path d="M4.5 15.5h15" />
    <path d="m5 11 4-7" />
    <path d="m9 11 1 9" />
  </>
);

const WalletIcon = makeIcon(
  <>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </>
);

const ZapIcon = makeIcon(
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
);

/* ------------------------------------------------------------------ */

const menuItems1 = [
  {
    title: "Reports",
    Icon: ChartPieIcon,
    count: 3,
  },
  {
    title: "Shopper messaging",
    Icon: MessageSquareTextIcon,
  },
  {
    title: "Launch simulator",
    Icon: BoomBoxIcon,
  },
  {
    title: "Affiliate program",
    Icon: CirclePlusIcon,
  },
];

const menuItems2 = [
  {
    title: "Disputes",
    Icon: FileIcon,
  },
  {
    title: "Billing",
    Icon: WalletIcon,
  },
  {
    title: "Settings",
    Icon: SettingsIcon,
  },
];

const menuItems3 = [
  {
    title: "Blog",
    Icon: RssIcon,
  },
  {
    title: "Contact Us",
    Icon: HeadsetIcon,
  },
];

const rightSidebarItems = [
  {
    Icon: ZapIcon,
  },
  {
    Icon: BellIcon,
  },
  {
    Icon: MailIcon,
  },
];

const notifications = [
  {
    time: "18 min ago",
    title: "Share & Earn: Rebaid Referral Program is Live!",
    category: "Product updates",
  },
  {
    time: "2 days ago",
    title: "New Integration Available: Rebaid x Cartloop",
    category: "Product updates",
  },
  {
    time: "4 days ago",
    title: "Grow with the Rebaid Partner Program",
    category: "Product updates",
  },
  {
    time: "1 week ago",
    title: "The Holiday Customer Retention Guide",
    category: "Marketing",
  },
  {
    time: "2 weeks ago",
    title: "Top 5 Cart Abandonment Solutions for Shopify",
    category: "Marketing",
  },
  {
    time: "3 weeks ago",
    title: "Top 7 SMS Marketing Apps for Shopify in 2021",
    category: "Marketing",
  },
  {
    time: "3 weeks ago",
    title: "SMS Marketing Guide for Fashion Brands",
    category: "Guides",
  },
  {
    time: "4 weeks ago",
    title: "How to Serve Up a Solid Branded Customer...",
    category: "Guest Writer",
  },
];

const dashboardItems = [
  {
    title: "Rebaid’s campaign",
    Icon: FlameIcon,
  },
  {
    title: "Discount campaign",
    Icon: GiftIcon,
  },
  {
    title: "Influencer campaign",
    Icon: PinIcon,
  },
];

const campaignItems = [
  {
    title: "4 Active",
    color: "#ffffff",
  },
  {
    title: "5 Paused",
    color: "#fae0d1",
  },
  {
    title: "3 Draft",
    color: "#de9489",
  },
  {
    title: "26 Ended",
    color: "#86759f",
  },
];

const campaigns = [
  {
    title: "Rebaid campaign",
    remaining: "48h",
    redemptions: 36,
    color: "#ffffff",
  },
  {
    title: "Alternative one",
    remaining: "72h",
    redemptions: 18,
    color: "#fae0d1",
  },
  {
    title: "Extra discount",
    remaining: "24h",
    redemptions: 52,
    color: "#f7bab4",
  },
  {
    title: "Influencer",
    remaining: "12h",
    redemptions: 24,
    color: "#d4bff2",
  },
  {
    title: "Rebaid campaign",
    remaining: "48h",
    redemptions: 36,
    color: "#ffffff",
  },
  {
    title: "Alternative one",
    remaining: "72h",
    redemptions: 18,
    color: "#fae0d1",
  },
  {
    title: "Extra discount",
    remaining: "24h",
    redemptions: 52,
    color: "#f7bab4",
  },
  {
    title: "Influencer",
    remaining: "12h",
    redemptions: 24,
    color: "#d4bff2",
  },
];

const influencers = [
  { name: "Nataly H.", image: "https://assets.codepen.io/3685267/advertising_dashboard_oqsmigok.png" },
  { name: "Jack M.", image: "https://assets.codepen.io/3685267/advertising_dashboard_hiwzaogx.png" },
  { name: "Erica A.", image: "https://assets.codepen.io/3685267/advertising_dashboard_bzsdwaaw.png" },
  { name: "Adam F.", image: "https://assets.codepen.io/3685267/advertising_dashboard_zdeztokp.png" },
  { name: "Kim H.", image: "https://assets.codepen.io/3685267/advertising_dashboard_nsiqbmcp.png" },
  { name: "Anna P.", image: "https://assets.codepen.io/3685267/advertising_dashboard_vmhdjezu.png" },
  { name: "Rita O.", image: "https://assets.codepen.io/3685267/advertising_dashboard_jddlfcvb.png" },
  { name: "Sophia L.", image: "https://assets.codepen.io/3685267/advertising_dashboard_vshneddw.png" },
  { name: "Brian K.", image: "https://assets.codepen.io/3685267/advertising_dashboard_prtjpsvs.png" },
  { name: "Chloe W.", image: "https://assets.codepen.io/3685267/advertising_dashboard_irerlhon.png" },
  { name: "Dylan R.", image: "https://assets.codepen.io/3685267/advertising_dashboard_bmvgnkwu.png" },
  { name: "Ella T.", image: "https://assets.codepen.io/3685267/advertising_dashboard_ojeeyaff.png" },
  { name: "Mason C.", image: "https://assets.codepen.io/3685267/advertising_dashboard_wkyeirtz.png" },
  { name: "Olivia D.", image: "https://assets.codepen.io/3685267/advertising_dashboard_zzrbsyjc.png" },
];

const statusItems = [
  {
    time: "current",
    title: "Views",
    count: 52550,
    percentage: 12.5,
    color1: "#ac9ac6",
    color2: "#5b4d77",
    Icon: EyeIcon,
  },
  {
    time: "current",
    title: "Redemptions",
    count: 4205,
    percentage: 32.5,
    color1: "#c4877e",
    color2: "#553a35",
    Icon: ShoppingBasketIcon,
  },
  {
    time: "current",
    title: "Code clips",
    count: 205,
    percentage: 3.8,
    color1: "#d9c1b3",
    color2: "#806d63",
    Icon: ZapIcon,
  },
];



function SidebarLeft() {
  const [val, setVal] = useState(false);
  return (
    <div className="fixed left-0 inset-y-0 w-64 flex-col p-4 hidden xl:flex overflow-x-hidden overflow-y-auto">
      <div className="shrink-0  flex items-center  justify-between">
        <img src="https://assets.codepen.io/3685267/advertising_dashboard_cfagbejq.png" alt="" className="h-9" />
        <div className="size-8  rounded-full  grid place-items-center  border-2 border-[#252628] color-[#ffff]">
          <ChevronLeftIcon className="size-5" strokeWidth={3} />
        </div>
      </div>
      <div className="shrink-0  bg-[#1b1c20] flex items-center   p-2 rounded-md  mt-3 ">
        <img
          src="https://assets.codepen.io/3685267/advertising_dashboard_moszhizg.png"
          alt=""
          className="size-9  object-center object-cover rounded-full  "
        />
        <div className="ml-2 ">
          <div className="font-semibold text-white">Emma Grace</div>
          <div className="text-[#7a7d82]">Admin account</div>
        </div>
        <EllipsisVerticalIcon
          className="size-4 ml-auto text-[#7a7d82]"
          strokeWidth={3}
        />
      </div>
      <div className=" shrink-0  py-2 mt-3 border-t-2 border-t-zinc-800">
        <button className="w-full flex items-center  space-x-2 bg-[#35383d] p-2 rounded-md text-white">
          <LayoutDashboardIcon className="size-5" />
          <div className="font-semibold">Dashboard</div>
        </button>
      </div>

      <div className="shrink-0  flex flex-col  py-1 border-t-2 border-t-zinc-800">
        {menuItems1.map(({ title, Icon, count }, idx) => (
          <button
            className="flex items-center p-1.5 rounded-md hover:bg-[#1e1e1e]"
            key={idx}
          >
            <Icon className="size-5 text-[#626367]" />
            <div className="ml-2 text-[#c0c4cd]"> {title}</div>
            {count && (
              <div className="grid place-items-center  size-6  bg-[#fae0d1] text-black rounded-md ml-auto ">
                {count}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="grow   flex flex-col  py-1 mt-1 border-t-2 border-t-zinc-800  ">
        {menuItems2.map(({ title, Icon }, idx) => (
          <button
            className="flex items-center  p-1.5 rounded-md hover:bg-[#1e1e1e]"
            key={idx}
          >
            <Icon className="size-5 text-[#626367]" />
            <div className="ml-2 text-[#c0c4cd]"> {title}</div>
          </button>
        ))}
      </div>
      <div className="shrink-0  flex flex-col  py-2 border-t-2 border-t-zinc-800 ">
        {menuItems3.map(({ title, Icon }, idx) => (
          <button
            className="flex items-center  p-1.5 rounded-md hover:bg-[#1e1e1e]"
            key={idx}
          >
            <Icon className="size-5 text-[#626367]" />
            <div className="ml-2 text-[#c0c4cd]"> {title}</div>
          </button>
        ))}
      </div>

      <div className="shrink-0  flex items-center justify-between mt-3">
        <div className="">Language</div>
        <button
          className="w-14 h-7 bg-[#242424] flex items-center  rounded-full  px-1"
          onClick={() => setVal((cur) => !cur)}
        >
          <div
            className="size-5  relative bg-white rounded-full transform transition-transform duration-500"
            style={{
              transform: `translate(${val ? "27px" : "0px"}, 0px)`,
            }}
          >
            <img
              src="https://assets.codepen.io/3685267/advertising_dashboard_dagkrvwl.png"
              alt=""
              className="size-4  object-center object-cover rounded-full  absolute transform left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 lan-img"
              style={{
                opacity: val ? 0 : 1,
              }}
            />
            <img
              src="https://assets.codepen.io/3685267/advertising_dashboard_bbstiyel.png"
              alt=""
              className="size-4  object-center object-cover rounded-full  absolute transform left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 lan-img"
              style={{
                opacity: val ? 1 : 0,
              }}
            />
          </div>
        </button>
      </div>
      <div
        className="shrink-0 aspect-[4/2] bg-zinc-900 mt-4 rounded-md  bg-cover bg-center"
        style={{
          backgroundImage: "url(https://assets.codepen.io/3685267/advertising_dashboard_deznkxdp.png)",
          paddingTop: "44px",
        }}
      >
        <div className="text-center text-base font-semibold mt-2 text-black">
          Need Help?
        </div>
        <div className="text-center mt-1 text-[#131313]">
          Our Support is 24/7 Online
        </div>
      </div>
    </div>
  );
}

function SidebarRight() {
  return (
    <div className="fixed  inset-y-0  right-0  w-64 px-4 pb-4 pt-2 hidden xl:block">
      <div className="flex items-center justify-between pb-2 border-b-2 border-b-zinc-800  ">
        {rightSidebarItems.map(({ Icon }, idx) => (
          <div
            className={`size-10  grid place-items-center  rounded-md ${
              idx === 0 ? "sidebar-right-selected" : ""
            }`}
            key={idx}
          >
            <Icon className="size-5" />
          </div>
        ))}
      </div>
      <div className="flex flex-col  space-y-2 mt-3 ">
        {notifications
          .filter((_, j) => j < 5)
          .map(({ title, time, category }, idx) => (
            <div
              className={`p-0.5 rounded-md ${idx === 3 ? "notification-selected" : ""}`}
              key={idx}
            >
              <div className="bg-zinc-950 p-3 rounded-md  ">
                <div className="text-[#70718e]">{time}</div>
                <div className="mt-1 font-semibold">{title}</div>
                <div className="mt-2 text-[#5b5b5b]">{category}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <div className="px-4">
        <div className="text-lg font-semibold">Dashboard</div>
        <div className="p-1 bg-[#000000]  rounded-md  mt-1 ">
          <div className="grid grid-cols-3 gap-2">
            {dashboardItems.map(({ title, Icon }, idx) => (
              <div
                className={`py-2 rounded-md  flex items-center  justify-center space-x-2 ${
                  idx === 0 ? "bg-[#35383d]" : ""
                }`}
                key={idx}
              >
                <Icon
                  className={`size-5 ${
                    idx === 0 ? "text-white" : "text-[#575757]"
                  }`}
                />
                <div className=""> {title} </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center  mt-2 px-4">
        <ShoppingBasketIcon className="size-5 text-[#6e7176]" />
        <div className="ml-2 text-base font-semibold">Campaigns</div>
        <div className="inline-flex items-center  ml-auto space-x-3 ">
          <div className="bg-[#35383d] px-2 py-0.5 rounded-md  ">All</div>
          {campaignItems.map(({ title, color }, idx) => (
            <div className="inline-flex items-center  space-x-2 " key={idx}>
              <div
                className="size-2  rounded-full  "
                style={{ background: color }}
              ></div>
              <div className=""> {title} </div>
            </div>
          ))}
          <div className="bg-[#35383d] px-2 py-0.5 rounded-md  ">
            All campaigns
          </div>
        </div>
      </div>
      <CampaignSlider />
    </>
  );
}

let swiper1 = null;

function next1() {
  swiper1.slideNext();
}

function CampaignSlider() {
  useEffect(() => {
    swiper1 = new Swiper(".mySwiper", {
      slidesPerView: "auto",
      spaceBetween: 16,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 40,
    });
  }, []);
  return (
    <>
      <div className="mt-3 relative">
        <div className="swiper mySwiper">
          <div className="swiper-wrapper">
            {campaigns.map(({ title, redemptions, remaining, color }, idx) => (
              <div
                className="swiper-slide rounded-md  p-3  select-none cursor-pointer campaign-slide"
                key={idx}
                style={{ background: color }}
              >
                <div className="flex items-center  border-b-2 border-b-[#6464648c] pb-2 ">
                  <div className="size-3  rounded-full  bg-[#37363e] "></div>
                  <div className="ml-2 font-semibold text-[#37363e]">
                    {" "}
                    {title}{" "}
                  </div>

                  <EllipsisIcon className="size-5 ml-auto text-[#555]" />
                </div>

                <div className="grid grid-cols-2 mt-3 ">
                  <div>
                    <div className="text-[#555]">Remaining</div>
                    <div className="flex items-center  space-x-2 ">
                      <ClockIcon className="size-4 text-[#555]" />
                      <div className="text-[#37363e] font-semibold">
                        {remaining}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[#555]">Redemptions</div>
                    <div className="flex items-center  space-x-2 ">
                      <div>
                        <ShoppingBag className="size-4 text-[#555]" />
                      </div>
                      <div className="text-[#37363e] font-semibold">
                        {redemptions}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute  inset-y-0  w-4 z-10"
          style={{
            background:
              "linear-gradient(90deg, #18181B 0%, rgba(24, 24, 27, 0) 100%)",
            left: "0px",
          }}
        ></div>
        <div
          className="absolute  inset-y-0  w-20 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(24, 24, 27, 0) 0%, #18181B 100%)",
            right: "0px",
          }}
        ></div>

        <button
          className="size-9  absolute  rounded-full  z-20 bg-white  grid place-items-center  "
          onClick={next1}
          style={{ right: "8px", top: "32px" }}
        >
          <ChevronRightIcon className="size-5 text-zinc-900" strokeWidth={3} />
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.campaign-slide{
  height:105px;
  width:220px;
}
`,
        }}
      ></style>
    </>
  );
}

function Influencers() {
  return (
    <>
      <div className="flex items-center  px-4 mt-3 ">
        <PinIcon className="size-5 text-[#606165]" />
        <div className="text-base font-semibold ml-2 ">Influencers</div>
        <div className="ml-auto bg-zinc-800 px-2 py-0.5 rounded-md ">
          All Influencers
        </div>
      </div>
      <InfluencerSlider />
    </>
  );
}

let swiper2 = null;

function next2() {
  swiper2.slideNext();
}

function InfluencerSlider() {
  useEffect(() => {
    swiper2 = new Swiper(".mySwiper2", {
      slidesPerView: "auto",
      spaceBetween: 0,
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 40,
    });
  }, []);
  return (
    <>
      <div className="mt-4 relative">
        <div className="swiper mySwiper2">
          <div className="swiper-wrapper">
            {influencers.map(({ name, image }, idx) => (
              <div
                className="swiper-slide select-none cursor-pointer influencer-slide"
                key={idx}
              >
                <div className="flex items-center justify-center">
                  <div className="border-2 border-zinc-800 rounded-full  p-1  ">
                    <img
                      src={image}
                      alt=""
                      className="size-14  occ rounded-full  "
                    />
                  </div>
                </div>

                <div className="text-center mt-1"> {name} </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute  inset-y-0  w-8 z-10"
          style={{
            background: "linear-gradient(90deg, #000 0%, #00000000 100%)",
            left: "0px",
          }}
        ></div>
        <div
          className="absolute  inset-y-0 w-20 z-10"
          style={{
            background: "linear-gradient(90deg, #00000000 0%, #000 100%)",
            right: "0px",
          }}
        ></div>

        <button
          className="size-9  absolute  rounded-full z-20 bg-white grid place-items-center "
          onClick={next2}
          style={{ right: "8px", top: "17px" }}
        >
          <ChevronRightIcon className="size-5 text-zinc-900" strokeWidth={3} />
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.influencer-slide{
  height:100px;
  width:90px;
}
`,
        }}
      ></style>
    </>
  );
}



function Graph() {

  const drawn = useRef(false)

  useEffect(()=>{
    if(!drawn.current){
      drawn.current  = true
      drawGraph()
    }
  },[])
  return (
    <div className='px-4' >
      <div className="flex items-center">

        <ChartColumnBigIcon className="size-5 text-[#606165]" />
        <div className="text-base font-semibold ml-2">Redemptions</div>
        <div className="ml-auto inline-flex items-center space-x-2 p-1 rounded-md bg-[#1b1c20]">
          <button
            className="w-16 bg-white text-[#1b1c20] rounded-md py-0.5 cursor-pointer"
            id="btn-24h"
          >
            24h
          </button>
          <button
            className="w-16 rounded-md py-0.5 cursor-pointer"
            id="btn-7d"
          >
            7d
          </button>
          <button
            className="w-16 rounded-md py-0.5 cursor-pointer"
            id="btn-1m"
          >
            1m
          </button>
        </div>
      </div>
      <div
        className="min-h-[175px] mt-2 bg-[#1b1c20] rounded-md"
        id="graph-container"
      ></div>
    </div>
  );
}
function QIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Status() {
  return (
    <div className="grid grid-cols-3 gap-3 mt-2 px-4">
      {statusItems.map(
        ({ title, count, percentage, color1, color2, Icon }, idx) => (
          <div className="p-3 rounded-md  bg-[#1b1c20]" key={idx}>
            <div className="flex items-center  space-x-2 ">
              <div className="font-semibold">{title} </div>
              <div
                className="
          grid place-items-center size-5 bg-[#28292d] rounded-full text-[#65666b]"
              >
                
                <QIcon />
              </div>
            </div>

            <div className="flex items-center  space-x-3 mt-2">
              <div
                className="size-9 grid place-items-center  rounded-full  text-[#3c3c55]"
                style={{ background: color1 }}
              >
                <Icon className="size-5" />
              </div>
              <div className="text-lg">{count}</div>
              <div
                className=" py-0.5 px-2 rounded-md "
                style={{ background: color2 }}
              >
                + {percentage}%
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}


const App = ()=> {
  return (
    <>
      <SidebarLeft />
      <SidebarRight />
      <div className="pl-0 pr-0 xl:pl-64  xl:pr-64">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-b-md bg-[#1b1c20] pt-1 pb-4">
            <Dashboard />
          </div>
          <Influencers />
          <Graph />
          <Status />
        </div>
      </div>
    </>
  );
}

ReactDOM.render(<App />,
document.getElementById("root"))
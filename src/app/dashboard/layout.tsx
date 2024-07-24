import SideBar from "@/components/SideBar/SideBar"
import { Layout } from "antd"

  export default function LayoutDashboard({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div >
        <SideBar/>
        <Layout style={{ marginLeft: 200 }}>
        {children}

        </Layout>
      </div>
    )
  }
  
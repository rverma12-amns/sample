import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Row,
  Col,
  message
} from "antd";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Option } = Select;

const kpiData = {
  Mining: {
    Drilling: [
      { kpi: "Drill Meterage", uom: "Meters/day", responsibility: "Mr. Ravindra Sarkar / Rishikant Mahkud", plan: 1299 },
      { kpi: "Drill Availability", uom: "%", responsibility: "Mr. Sunil Shetty / Mr. Ranjeet Sahoo", plan: 95 },
      { kpi: "Drill Meterage", Uom: "Meters drilled/day", responsibility: "Mr. Mohan Reddy", email: "prashant@gmail.com" },    
    
    { kpi: "Drill Utilization", Uom: "%", responsibility: "Mr. Mohan Reddy", email: "prashant@gmail.com" },
    { kpi: "Drill Utilization(In Hours)", Uom: "Hrs/day", responsibility: "Mr. Mohan Reddy", email: "dinesh@gmail.com" },
    { kpi: "Drill productivity", Uom: "Meters/hr.", responsibility: "Mr. Mohan Reddy", email: "dinesh@gmail.com" }, 
    
    ],
    Blasting: [
      { kpi: "Blast Yield (PF)", uom: "Tons/kg", responsibility: "Mr. Ravindra Sarkar", plan: 5 },
      { kpi: "Blast Inventory", uom: "Tons/day", responsibility: "Mr. Ravindra Sarkar", plan: 26667 }
    ],
    
    
  }
};

const KPIDashboard = () => {
  const [form] = Form.useForm();
  const [activityOptions, setActivityOptions] = useState([]);
  const [kpiOptions, setKpiOptions] = useState([]);
  const [entries, setEntries] = useState([]);

  const handleProcessChange = (value) => {
    const activities = Object.keys(kpiData[value] || {});
    setActivityOptions(activities);
    form.resetFields(["activity", "kpi", "uom", "responsibility", "plan"]);
    setKpiOptions([]);
  };

  const handleActivityChange = (value) => {
    const process = form.getFieldValue("process");
    const kpis = kpiData[process]?.[value] || [];
    setKpiOptions(kpis);
    form.resetFields(["kpi", "uom", "responsibility", "plan"]);
  };

  const handleKPIChange = (value) => {
    const process = form.getFieldValue("process");
    const activity = form.getFieldValue("activity");
    const selected = kpiData[process]?.[activity]?.find(k => k.kpi === value);
    if (selected) {
      form.setFieldsValue({
        uom: selected.uom,
        responsibility: selected.responsibility,
        plan: selected.plan
      });
    }
  };

  const addEntry = () => {
    const values = form.getFieldsValue();
    if (!values.date || !values.kpiValue) {
      message.warning("Please enter both date and value");
      return;
    }

    const newEntry = {
      key: entries.length + 1,
      date: values.date.format("YYYY-MM-DD"),
      process: values.process,
      activity: values.activity,
      kpi: values.kpi,
      uom: values.uom,
      responsibility: values.responsibility,
      plan: values.plan,
      value: values.kpiValue
    };

    setEntries([...entries, newEntry]);
    form.setFieldsValue({ date: null, kpiValue: null });
  };

  const exportExcel = () => {
    const sheet = [
      ["Date", "Process", "Activity", "KPI", "UoM", "Plan/day", "Actual", "Responsibility"],
      ...entries.map(e => [e.date, e.process, e.activity, e.kpi, e.uom, e.plan, e.value, e.responsibility])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KPI Data");
    XLSX.writeFile(workbook, "Mining_KPI_Report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Mining KPI Report", 14, 20);

    doc.autoTable({
      startY: 30,
      head: [["Date", "Process", "Activity", "KPI", "UoM", "Plan", "Actual", "Responsibility"]],
      body: entries.map(e => [e.date, e.process, e.activity, e.kpi, e.uom, e.plan, e.value, e.responsibility])
    });

    doc.save("Mining_KPI_Report.pdf");
  };

  const columns = [
    { title: "Date", dataIndex: "date" },
    { title: "Process", dataIndex: "process" },
    { title: "Activity", dataIndex: "activity" },
    { title: "KPI", dataIndex: "kpi" },
    { title: "UoM", dataIndex: "uom" },
    { title: "Plan", dataIndex: "plan" },
    { title: "Actual", dataIndex: "value" },
    { title: "Responsibility", dataIndex: "responsibility" }
  ];

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 900, margin: "auto" }}>
      <h2>📋 Mining KPI Entry</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Process" name="process" rules={[{ required: true }]}>
            <Select placeholder="Select Process" onChange={handleProcessChange}>
              {Object.keys(kpiData).map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Activity" name="activity" rules={[{ required: true }]}>
            <Select placeholder="Select Activity" onChange={handleActivityChange}>
              {activityOptions.map(a => <Option key={a} value={a}>{a}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="KPI" name="kpi" rules={[{ required: true }]}>
            <Select placeholder="Select KPI" onChange={handleKPIChange}>
              {kpiOptions.map(k => <Option key={k.kpi} value={k.kpi}>{k.kpi}</Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="UoM" name="uom">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Responsibility" name="responsibility">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Plan/Day" name="plan">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Date" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Actual KPI Value" name="kpiValue" rules={[{ required: true }]}>
            <Input placeholder="Enter KPI value" type="number" />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Button type="dashed" onClick={addEntry} style={{ marginTop: 32 }} block>
            ➕ Add Entry
          </Button>
        </Col>
        <Col span={6}>
          <Button onClick={exportExcel} style={{ marginTop: 32, background: "#1890ff", color: "#fff" }} block>
            📊 Export Excel
          </Button>
        </Col>
        <Col span={6}>
          <Button onClick={exportPDF} style={{ marginTop: 32, background: "#1890ff", color: "#fff" }} block>
            📄 Export PDF
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={entries}
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 30 }}
      />
    </Form>
  );
};

export default KPIDashboard;



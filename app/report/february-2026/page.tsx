"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function February2026Report() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print-hidden header */}
      <div className="print:hidden bg-muted/50 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dear SA
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl print:max-w-none print:px-0 print:py-0">
        
        {/* Report Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-foreground print:text-2xl">Zebra Digital Media</h1>
          <p className="text-muted-foreground mt-1">Trading as Dear South Africa</p>
          <div className="mt-4 p-4 bg-primary/5 rounded-lg inline-block print:bg-transparent print:border print:border-border">
            <h2 className="text-xl font-semibold">Financial Report</h2>
            <p className="text-muted-foreground">February 2026</p>
            <p className="text-sm text-muted-foreground">Reporting Period: 1 - 28 February 2026</p>
          </div>
        </div>

        {/* Grant Overview */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Grant Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Grant</p>
                <p className="text-xl font-bold text-foreground">R290,000</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Disbursed to Date</p>
                <p className="text-xl font-bold text-foreground">R174,000</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Cumulative Spent</p>
                <p className="text-xl font-bold text-foreground">R173,933.37</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Balance (27 Feb)</p>
                <p className="text-xl font-bold text-primary">R66.63</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Second tranche of R116,000 due upon satisfactory narrative report submission by 30 June 2026
            </p>
          </CardContent>
        </Card>

        {/* February Expenditure Summary */}
        <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">February 2026 Expenditure Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Category</th>
                    <th className="text-right py-2 font-semibold">Budget</th>
                    <th className="text-right py-2 font-semibold">February Spend</th>
                    <th className="text-right py-2 font-semibold">% of Month</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Travel</td>
                    <td className="text-right py-2">R5,000</td>
                    <td className="text-right py-2">R448.00</td>
                    <td className="text-right py-2 text-muted-foreground">1.2%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Technology/Platform Development</td>
                    <td className="text-right py-2">R175,000</td>
                    <td className="text-right py-2">R2,066.09</td>
                    <td className="text-right py-2 text-muted-foreground">5.7%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Contractual (Project Management)</td>
                    <td className="text-right py-2">R80,000</td>
                    <td className="text-right py-2">R25,000.00</td>
                    <td className="text-right py-2 text-muted-foreground">69.1%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Community Engagement</td>
                    <td className="text-right py-2">R15,000</td>
                    <td className="text-right py-2">R4,000.00</td>
                    <td className="text-right py-2 text-muted-foreground">11.1%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Marketing & Advertising</td>
                    <td className="text-right py-2">R5,000</td>
                    <td className="text-right py-2">R384.10</td>
                    <td className="text-right py-2 text-muted-foreground">1.1%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Legal & Compliance</td>
                    <td className="text-right py-2">R10,000</td>
                    <td className="text-right py-2">R4,000.00</td>
                    <td className="text-right py-2 text-muted-foreground">11.1%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Bank & Service Fees</td>
                    <td className="text-right py-2">-</td>
                    <td className="text-right py-2">R200.00</td>
                    <td className="text-right py-2 text-muted-foreground">0.6%</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted/50">
                    <td className="py-3">TOTAL FEBRUARY EXPENDITURE</td>
                    <td className="text-right py-3">R290,000</td>
                    <td className="text-right py-3">R36,098.19</td>
                    <td className="text-right py-3">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Transaction List */}
        <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detailed Transaction Register - February 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-2 font-semibold">Date</th>
                    <th className="text-left py-2 px-2 font-semibold">Description</th>
                    <th className="text-left py-2 px-2 font-semibold">Category</th>
                    <th className="text-right py-2 px-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Technology/Platform */}
                  <tr className="border-b bg-blue-50/50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-blue-700">Technology / Platform Development</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">29 Jan*</td>
                    <td className="py-2 px-2">Vercel Inc - Hosting</td>
                    <td className="py-2 px-2 text-muted-foreground">Technology</td>
                    <td className="text-right py-2 px-2">R344.20</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">3 Feb</td>
                    <td className="py-2 px-2">Vercel Inc - Hosting</td>
                    <td className="py-2 px-2 text-muted-foreground">Technology</td>
                    <td className="text-right py-2 px-2">R344.48</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">10 Feb</td>
                    <td className="py-2 px-2">Vercel Inc - Hosting</td>
                    <td className="py-2 px-2 text-muted-foreground">Technology</td>
                    <td className="text-right py-2 px-2">R346.85</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">14 Feb</td>
                    <td className="py-2 px-2">Vercel Inc - Hosting</td>
                    <td className="py-2 px-2 text-muted-foreground">Technology</td>
                    <td className="text-right py-2 px-2">R344.48</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">21 Feb</td>
                    <td className="py-2 px-2">Vercel Inc - Hosting</td>
                    <td className="py-2 px-2 text-muted-foreground">Technology</td>
                    <td className="text-right py-2 px-2">R342.39</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">26 Feb</td>
                    <td className="py-2 px-2">Vercel Inc - Hosting</td>
                    <td className="py-2 px-2 text-muted-foreground">Technology</td>
                    <td className="text-right py-2 px-2">R343.69</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Technology</td>
                    <td className="text-right py-2 px-2">R2,066.09</td>
                  </tr>

                  {/* Contractual */}
                  <tr className="border-b bg-green-50/50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-green-700">Contractual / Project Management</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">9 Feb</td>
                    <td className="py-2 px-2">Phillip Dube - Project Management</td>
                    <td className="py-2 px-2 text-muted-foreground">Contractual</td>
                    <td className="text-right py-2 px-2">R10,000.00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">11 Feb</td>
                    <td className="py-2 px-2">Phillip Dube - Section D Work</td>
                    <td className="py-2 px-2 text-muted-foreground">Contractual</td>
                    <td className="text-right py-2 px-2">R10,000.00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">20 Feb</td>
                    <td className="py-2 px-2">Phillip Dube - App Development</td>
                    <td className="py-2 px-2 text-muted-foreground">Contractual</td>
                    <td className="text-right py-2 px-2">R5,000.00</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Contractual</td>
                    <td className="text-right py-2 px-2">R25,000.00</td>
                  </tr>

                  {/* Community Engagement */}
                  <tr className="border-b bg-purple-50/50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-purple-700">Community Engagement</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">23 Feb</td>
                    <td className="py-2 px-2">Community Engagement Activities</td>
                    <td className="py-2 px-2 text-muted-foreground">Engagement</td>
                    <td className="text-right py-2 px-2">R4,000.00</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Community Engagement</td>
                    <td className="text-right py-2 px-2">R4,000.00</td>
                  </tr>

                  {/* Marketing */}
                  <tr className="border-b bg-orange-50/50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-orange-700">Marketing & Advertising</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">Various</td>
                    <td className="py-2 px-2">Facebook Advertising (R37.95 + R52.90 + R115.00 + R178.25)</td>
                    <td className="py-2 px-2 text-muted-foreground">Marketing</td>
                    <td className="text-right py-2 px-2">R384.10</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Marketing</td>
                    <td className="text-right py-2 px-2">R384.10</td>
                  </tr>

                  {/* Legal & Compliance */}
                  <tr className="border-b bg-red-50/50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-red-700">Legal & Compliance</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">26 Feb</td>
                    <td className="py-2 px-2">Dikeledi Dube - Legal & Compliance</td>
                    <td className="py-2 px-2 text-muted-foreground">Legal</td>
                    <td className="text-right py-2 px-2">R4,000.00</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Legal & Compliance</td>
                    <td className="text-right py-2 px-2">R4,000.00</td>
                  </tr>

                  {/* Travel */}
                  <tr className="border-b bg-yellow-50/50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-yellow-700">Travel</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">Various</td>
                    <td className="py-2 px-2">Bolt - Transport</td>
                    <td className="py-2 px-2 text-muted-foreground">Travel</td>
                    <td className="text-right py-2 px-2">R248.00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">Various</td>
                    <td className="py-2 px-2">Uber Contribution</td>
                    <td className="py-2 px-2 text-muted-foreground">Travel</td>
                    <td className="text-right py-2 px-2">R200.00</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Travel</td>
                    <td className="text-right py-2 px-2">R448.00</td>
                  </tr>

                  {/* Service Fees */}
                  <tr className="border-b bg-gray-50">
                    <td colSpan={4} className="py-2 px-2 font-semibold text-gray-700">Bank & Service Fees</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">Various</td>
                    <td className="py-2 px-2">FNB Bank Service Fees</td>
                    <td className="py-2 px-2 text-muted-foreground">Fees</td>
                    <td className="text-right py-2 px-2">~R200.00</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td colSpan={3} className="py-2 px-2 text-right">Subtotal Fees</td>
                    <td className="text-right py-2 px-2">~R200.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-primary/10">
                    <td colSpan={3} className="py-3 px-2">GRAND TOTAL - FEBRUARY 2026</td>
                    <td className="text-right py-3 px-2">R36,098.19</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Transaction dated 29 Jan processed in February statement period</p>
          </CardContent>
        </Card>

        {/* Budget vs Actual Comparison */}
        <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cumulative Budget vs Actual (Jan + Feb 2026)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Category</th>
                    <th className="text-right py-2 font-semibold">Full Budget</th>
                    <th className="text-right py-2 font-semibold">Cumulative Spent</th>
                    <th className="text-right py-2 font-semibold">Remaining</th>
                    <th className="text-right py-2 font-semibold">% Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Digital Infrastructure & Technology</td>
                    <td className="text-right py-2">R175,000</td>
                    <td className="text-right py-2">R89,642.81</td>
                    <td className="text-right py-2">R85,357.19</td>
                    <td className="text-right py-2">51%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Content Development & Journalism</td>
                    <td className="text-right py-2">R24,000</td>
                    <td className="text-right py-2">R10,000</td>
                    <td className="text-right py-2">R14,000</td>
                    <td className="text-right py-2">42%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Audience Growth & Engagement</td>
                    <td className="text-right py-2">R15,000</td>
                    <td className="text-right py-2">R4,599.15</td>
                    <td className="text-right py-2">R10,400.85</td>
                    <td className="text-right py-2">31%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Revenue Generation & Sustainability</td>
                    <td className="text-right py-2">R12,000</td>
                    <td className="text-right py-2">R0</td>
                    <td className="text-right py-2">R12,000</td>
                    <td className="text-right py-2">0%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Operational & Administrative</td>
                    <td className="text-right py-2">R58,000</td>
                    <td className="text-right py-2">R63,691.41</td>
                    <td className="text-right py-2 text-red-600">-R5,691.41</td>
                    <td className="text-right py-2 text-red-600">110%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Equipment</td>
                    <td className="text-right py-2">R6,000</td>
                    <td className="text-right py-2">R6,000</td>
                    <td className="text-right py-2">R0</td>
                    <td className="text-right py-2">100%</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted/50">
                    <td className="py-3">TOTAL</td>
                    <td className="text-right py-3">R290,000</td>
                    <td className="text-right py-3">R173,933.37</td>
                    <td className="text-right py-3">R116,066.63</td>
                    <td className="text-right py-3">60%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Operational & Administrative costs are slightly over budget due to higher project management requirements during the intensive development phase. This will be offset by underspend in other categories. Overall expenditure remains within the total grant allocation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Statement */}
        <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cash Flow Statement - February 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Opening Balance (27 January 2026)</span>
                <span className="font-semibold">R40,902.76</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-green-600">Add: Income / Deposits</span>
                <span className="text-green-600">R0.00</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-red-600">Less: Total Expenditure</span>
                <span className="text-red-600">-R36,098.19</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Less: Non-Grant Expenditure (excluded)</span>
                <span className="text-muted-foreground">-R4,737.94</span>
              </div>
              <Separator />
              <div className="flex justify-between py-2">
                <span className="font-bold">Closing Balance (27 February 2026)</span>
                <span className="font-bold text-primary">R66.63</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Non-grant expenditure includes personal items not related to the DNTF grant. 
              Second tranche of R116,000 pending upon satisfactory narrative report.
            </p>
          </CardContent>
        </Card>

        {/* Financial Health Indicators */}
        <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Financial Health Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">Burn Rate (Feb)</p>
                <p className="text-2xl font-bold text-green-800">R36,098/month</p>
                <p className="text-xs text-green-600 mt-1">Down from R103,078 in Jan (development phase)</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Grant Utilisation</p>
                <p className="text-2xl font-bold text-blue-800">60%</p>
                <p className="text-xs text-blue-600 mt-1">Of first tranche (R174,000) utilised</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 font-medium">Runway (at Feb rate)</p>
                <p className="text-2xl font-bold text-amber-800">3.2 months</p>
                <p className="text-xs text-amber-600 mt-1">With second tranche (R116,000)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6 print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notes to Financial Statements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">1. Accounting Basis</h4>
              <p className="text-muted-foreground">
                This report is prepared on a cash basis, recording transactions when cash is received or paid. 
                All amounts are in South African Rand (ZAR).
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">2. Grant Recognition</h4>
              <p className="text-muted-foreground">
                The total grant of R290,000 from DNTF is disbursed in two tranches: R174,000 (received December 2025) 
                and R116,000 (due upon satisfactory narrative report submission by 30 June 2026).
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">3. Related Party Transactions</h4>
              <p className="text-muted-foreground">
                Payments to Phillip Dube (Project Manager/Founder) for project management and development work, 
                and to Dikeledi Dube (Co-founder) for legal and compliance activities are disclosed as related party transactions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">4. Excluded Transactions</h4>
              <p className="text-muted-foreground">
                A payment of R4,760 to Phillip Dube on 17 February 2026 has been excluded from grant expenditure 
                as it was not clearly labelled as grant-related. Additionally, personal expenses appearing in the 
                bank statement have been excluded from this report.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">5. Budget Variance</h4>
              <p className="text-muted-foreground">
                Operational & Administrative costs exceeded budget by R5,691.41 (110% of allocation) due to 
                intensive project management requirements during the platform development phase. This overspend 
                is offset by underspend in Revenue Generation (0% used) and Audience Growth (31% used) categories, 
                which are scheduled for later project phases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certification */}
        <Card className="print:shadow-none print:border print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              I certify that this financial report accurately reflects the financial transactions 
              of Zebra Digital Media (trading as Dear South Africa) for the period 1 - 28 February 2026, 
              and that all expenditure reported was incurred in furtherance of the project objectives 
              as outlined in the grant agreement with DNTF.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-semibold">Prepared by:</p>
                <div className="mt-4 border-b border-foreground w-48"></div>
                <p className="text-sm mt-1">Mthokozisi Dube</p>
                <p className="text-xs text-muted-foreground">Project Manager / Founder</p>
              </div>
              <div>
                <p className="font-semibold">Date:</p>
                <div className="mt-4 border-b border-foreground w-48"></div>
                <p className="text-sm mt-1">2 March 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground print:mt-4">
          <Separator className="mb-4" />
          <p>Zebra Digital Media (Pty) Ltd | Trading as Dear South Africa</p>
          <p>www.dearsa.africa | info@dearsa.africa | Tel: 078 329 2334</p>
          <p className="mt-2">Supported by the Google News Initiative Digital News Transformation Fund, administered by Tshikululu Social Investments</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  )
}

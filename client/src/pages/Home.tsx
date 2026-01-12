import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Activity,
  DollarSign,
  Users,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="TOTAL VOLUME (24H)" 
          value="$42,892,104" 
          change="+12.5%" 
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard 
          title="ACTIVE ANOMALIES" 
          value="7 DETECTED" 
          change="+2" 
          isPositive={false}
          icon={AlertTriangle}
          alert
        />
        <StatCard 
          title="INSIDER SIGNALS" 
          value="3 HIGH CONFIDENCE" 
          change="NEW" 
          isPositive={true}
          icon={Zap}
        />
        <StatCard 
          title="SMART MONEY FLOW" 
          value="+$1.2M NET" 
          change="+5.2%" 
          isPositive={true}
          icon={TrendingUp}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Market Anomaly Heatmap
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">LIVE</Badge>
              <Badge variant="outline" className="font-mono text-xs">1H</Badge>
              <Badge variant="outline" className="font-mono text-xs">4H</Badge>
              <Badge variant="outline" className="font-mono text-xs">24H</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-black/20 border border-border/50 relative overflow-hidden group">
              {/* Simulated Chart Visual */}
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4 gap-1">
                {Array.from({ length: 40 }).map((_, i) => {
                  const height = Math.random() * 80 + 10;
                  const isAnomaly = Math.random() > 0.9;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "w-full transition-all duration-500 hover:opacity-80",
                        isAnomaly ? "bg-destructive shadow-[0_0_10px_var(--color-destructive)]" : "bg-primary/30"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Overlay Info */}
              <div className="absolute top-4 left-4 font-mono text-xs text-primary">
                <div>MAX VOL: $2.4M</div>
                <div>AVG VOL: $450K</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-card/50 backdrop-blur-sm border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              <AlertItem 
                time="10:42:15"
                type="INSIDER"
                message="New wallet created 2h ago placed $50k bet on 'Trump vs Biden'"
                severity="high"
              />
              <AlertItem 
                time="10:38:22"
                type="VOLUME"
                message="Unusual volume spike detected in 'Fed Rate Cut' market"
                severity="medium"
              />
              <AlertItem 
                time="10:15:00"
                type="PIZZA"
                message="Pizza orders near Pentagon +240% above average"
                severity="critical"
              />
              <AlertItem 
                time="09:55:12"
                type="WHALE"
                message="Known whale address moved $2M to Polymarket"
                severity="medium"
              />
              <AlertItem 
                time="09:30:45"
                type="SOCIAL"
                message="Sentiment shift detected for 'Bitcoin ETF Approval'"
                severity="low"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Smart Money Movers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "0x7a...3f92", winRate: "82%", pnl: "+$452k", status: "Buying" },
                { name: "0x3b...8a11", winRate: "76%", pnl: "+$128k", status: "Selling" },
                { name: "0x9c...2e44", winRate: "91%", pnl: "+$890k", status: "Holding" },
              ].map((trader, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/20 border border-border/50 hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary flex items-center justify-center font-mono text-xs font-bold text-secondary-foreground">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">{trader.name}</div>
                      <div className="text-xs text-muted-foreground">Win Rate: {trader.winRate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-primary font-bold">{trader.pnl}</div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] h-5",
                      trader.status === "Buying" ? "text-primary border-primary/30" : 
                      trader.status === "Selling" ? "text-destructive border-destructive/30" : 
                      "text-muted-foreground border-border"
                    )}>
                      {trader.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero_detection.jpg')] bg-cover bg-center opacity-10" />
          <CardHeader>
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <StatusItem label="Pizza Watch" status="ONLINE" ping="24ms" />
              <StatusItem label="Polyfactual AI" status="PROCESSING" ping="112ms" />
              <StatusItem label="Hashdive" status="ONLINE" ping="45ms" />
              <StatusItem label="Polysights" status="ONLINE" ping="32ms" />
            </div>
            
            <div className="mt-6 p-4 border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-xs font-bold uppercase">System Prediction</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI analysis indicates a <span className="text-foreground font-bold">78% probability</span> of major volatility in "US Election 2024" markets within the next 4 hours based on social sentiment divergence.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, alert = false }: any) {
  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur-sm border-border transition-all duration-300 hover:border-primary/50 group",
      alert && "border-destructive/50 bg-destructive/5 hover:border-destructive"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{title}</span>
          <Icon className={cn(
            "w-4 h-4",
            alert ? "text-destructive" : "text-primary opacity-50 group-hover:opacity-100 transition-opacity"
          )} />
        </div>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-mono font-bold text-foreground tracking-tight">{value}</div>
          <div className={cn(
            "text-xs font-mono font-bold px-1.5 py-0.5",
            isPositive ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
          )}>
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ time, type, message, severity }: any) {
  const severityMap = {
    low: "border-l-2 border-muted-foreground",
    medium: "border-l-2 border-yellow-500",
    high: "border-l-2 border-orange-500",
    critical: "border-l-2 border-destructive animate-pulse-slow"
  };
  
  const severityColor = severityMap[severity as keyof typeof severityMap] || "border-l-2 border-muted-foreground";

  return (
    <div className={cn("p-3 bg-black/40 border border-border/50 hover:bg-white/5 transition-colors", severityColor)}>
      <div className="flex items-center justify-between mb-1">
        <Badge variant="outline" className="text-[10px] h-4 px-1 font-mono border-border text-muted-foreground">
          {type}
        </Badge>
        <span className="text-[10px] font-mono text-muted-foreground">{time}</span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">
        {message}
      </p>
    </div>
  );
}

function StatusItem({ label, status, ping }: any) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[10px] font-bold",
          status === "ONLINE" ? "text-primary" : "text-yellow-500"
        )}>{status}</span>
        <span className="text-[10px] text-muted-foreground font-mono">[{ping}]</span>
      </div>
    </div>
  );
}

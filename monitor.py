import os
import json
import time
import hashlib
import requests
import urllib.parse
from datetime import datetime, timedelta

# 配置
GAMMA_API_URL = "https://gamma-api.polymarket.com/events"
CLOB_API_URL = "https://clob.polymarket.com"

DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
MIN_TRADE_SIZE = 5000  # 最小监控金额 (USD)
SEEN_ORDERS_FILE = "seen_orders.json"
ALERTS_DATA_FILE = "client/public/data/alerts.json"

def load_seen_orders():
    """加载已处理过的订单记录"""
    if os.path.exists(SEEN_ORDERS_FILE):
        try:
            with open(SEEN_ORDERS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading seen orders: {e}")
    return {}

def save_seen_orders(seen_orders):
    """保存已处理过的订单记录"""
    try:
        with open(SEEN_ORDERS_FILE, 'w') as f:
            json.dump(seen_orders, f)
    except Exception as e:
        print(f"Error saving seen orders: {e}")

def clean_old_orders(seen_orders):
    """清理超过 24 小时的旧记录"""
    cutoff_time = (datetime.utcnow() - timedelta(hours=24)).timestamp()
    cleaned = {k: v for k, v in seen_orders.items() if v > cutoff_time}
    return cleaned

def load_alerts_data():
    """加载历史警报数据"""
    if os.path.exists(ALERTS_DATA_FILE):
        try:
            with open(ALERTS_DATA_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading alerts data: {e}")
    return []

def save_alerts_data(alerts):
    """保存警报数据，只保留最近 50 条"""
    try:
        # 确保目录存在
        os.makedirs(os.path.dirname(ALERTS_DATA_FILE), exist_ok=True)
        
        # 按时间倒序排序（新的在前）
        alerts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # 只保留前 50 条
        kept_alerts = alerts[:50]
        
        with open(ALERTS_DATA_FILE, 'w') as f:
            json.dump(kept_alerts, f, indent=2)
    except Exception as e:
        print(f"Error saving alerts data: {e}")

def generate_order_id(market_id, price, size, side):
    """生成唯一的订单 ID"""
    raw_str = f"{market_id}-{price}-{size}-{side}"
    return hashlib.md5(raw_str.encode()).hexdigest()

def send_discord_alert(embeds):
    """发送 Discord 警报"""
    if not DISCORD_WEBHOOK_URL:
        print("Error: DISCORD_WEBHOOK_URL not set.")
        return

    data = {
        "username": "Anomaly Monitor",
        "avatar_url": "https://polymarket.com/favicon.ico",
        "embeds": embeds
    }
    
    try:
        response = requests.post(DISCORD_WEBHOOK_URL, json=data)
        if response.status_code == 204:
            print("Discord alert sent successfully.")
        else:
            print(f"Failed to send Discord alert: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Exception sending Discord alert: {e}")

def get_top_markets():
    """获取当前热门市场 ID"""
    try:
        params = {
            "limit": 10,
            "active": "true",
            "closed": "false",
            "order": "volume"
        }
        response = requests.get(GAMMA_API_URL, params=params)
        if response.status_code != 200:
            print(f"Error fetching markets: {response.status_code}")
            return []
        
        events = response.json()
        market_ids = []
        for event in events:
            for market in event.get('markets', []):
                # 提取 clobTokenIds 中的第一个作为主 token_id
                token_ids = json.loads(market.get('clobTokenIds', '[]'))
                if token_ids:
                    market_ids.append({
                        "id": token_ids[0], # 使用 CLOB token ID
                        "question": market['question'],
                        "slug": event.get('slug', 'unknown'),
                        "outcomes": json.loads(market.get('outcomes', '[]'))
                    })
        return market_ids
    except Exception as e:
        print(f"Exception fetching markets: {e}")
        return []

def check_whale_orders(market, seen_orders):
    """检测巨鲸挂单"""
    url = f"{CLOB_API_URL}/book"
    params = {"token_id": market['id']}
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            book = response.json()
            new_anomalies = []
            
            # 检查买单 (Bids)
            for bid in book.get('bids', []):
                price = float(bid['price'])
                size = float(bid['size'])
                value = price * size
                if value > MIN_TRADE_SIZE:
                    order_id = generate_order_id(market['id'], price, size, "BID")
                    if order_id not in seen_orders:
                        new_anomalies.append({
                            "type": "Whale Bid (Buy Wall)",
                            "price": price,
                            "size": size,
                            "value": value,
                            "side": "YES",
                            "order_id": order_id
                        })
            
            # 检查卖单 (Asks)
            for ask in book.get('asks', []):
                price = float(ask['price'])
                size = float(ask['size'])
                value = price * size
                if value > MIN_TRADE_SIZE:
                    order_id = generate_order_id(market['id'], price, size, "ASK")
                    if order_id not in seen_orders:
                        new_anomalies.append({
                            "type": "Whale Ask (Sell Wall)",
                            "price": price,
                            "size": size,
                            "value": value,
                            "side": "YES",
                            "order_id": order_id
                        })
            
            return new_anomalies
    except Exception as e:
        print(f"Error checking order book for {market['question']}: {e}")
    return []

def scan_markets():
    """扫描市场异动"""
    print(f"Scanning top markets for anomalies...")
    
    # 加载去重记录
    seen_orders = load_seen_orders()
    seen_orders = clean_old_orders(seen_orders) # 清理旧数据
    
    # 加载历史警报数据
    existing_alerts = load_alerts_data()
    
    markets = get_top_markets()
    all_anomalies = []
    new_seen_count = 0
    
    print(f"Found {len(markets)} markets to scan.")
    
    for market in markets:
        print(f"Checking: {market['question'][:30]}...")
        anomalies = check_whale_orders(market, seen_orders)
        
        for anomaly in anomalies:
            # 生成搜索链接
            query = urllib.parse.quote(market['question'])
            twitter_url = f"https://twitter.com/search?q={query}&src=typed_query"
            google_url = f"https://www.google.com/search?q={query}"
            
            # Discord Embed 格式
            embed = {
                "title": f"🚨 {anomaly['type']} Detected!",
                "description": (
                    f"**Market:** [{market['question']}](https://polymarket.com/event/{market['slug']})\n"
                    f"**Value:** ${anomaly['value']:,.2f}\n"
                    f"**Price:** {anomaly['price']}\n"
                    f"**Size:** {anomaly['size']:,.0f}\n\n"
                    f"🔍 **Search:** [Twitter]({twitter_url}) | [Google]({google_url})"
                ),
                "color": 16711680 if "Ask" in anomaly['type'] else 65280, # Red for Ask, Green for Bid
                "footer": {"text": "Polymarket Anomaly Monitor"},
                "timestamp": datetime.utcnow().isoformat()
            }
            all_anomalies.append(embed)
            
            # 前端数据格式 (简化版)
            frontend_alert = {
                "id": anomaly['order_id'],
                "time": datetime.utcnow().strftime("%H:%M:%S"),
                "timestamp": datetime.utcnow().isoformat(),
                "type": "WHALE", # 统一标记为 WHALE，或者细分
                "message": f"{anomaly['type']} detected in '{market['question']}' (Value: ${anomaly['value']:,.0f})",
                "severity": "high" if anomaly['value'] > 50000 else "medium",
                "market_question": market['question'],
                "market_slug": market['slug'],
                "value": anomaly['value'],
                "price": anomaly['price'],
                "size": anomaly['size']
            }
            existing_alerts.append(frontend_alert)
            
            # 记录到 seen_orders，值为当前时间戳
            seen_orders[anomaly['order_id']] = datetime.utcnow().timestamp()
            new_seen_count += 1
            
        # 避免 API 速率限制
        time.sleep(0.2)
        
    if all_anomalies:
        print(f"Found {len(all_anomalies)} NEW anomalies. Sending alerts...")
        # 分批发送，避免 Discord 限制
        for i in range(0, len(all_anomalies), 10):
            batch = all_anomalies[i:i+10]
            send_discord_alert(batch)
            
        # 保存更新后的前端数据
        save_alerts_data(existing_alerts)
        print(f"Updated frontend alerts data. Total records: {len(existing_alerts)}")
    else:
        print("No NEW anomalies found.")

    # 保存更新后的去重记录
    save_seen_orders(seen_orders)
    print(f"Updated seen orders cache. Total tracked: {len(seen_orders)}")

if __name__ == "__main__":
    scan_markets()

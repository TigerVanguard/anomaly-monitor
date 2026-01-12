import os
import json
import time
import requests
from datetime import datetime, timedelta

# 配置
GAMMA_API_URL = "https://gamma-api.polymarket.com/events"
CLOB_API_URL = "https://clob.polymarket.com"

DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
MIN_TRADE_SIZE = 5000  # 最小监控金额 (USD)
LOOKBACK_MINUTES = 15  # 扫描过去多少分钟的数据

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

def check_whale_orders(market):
    """检测巨鲸挂单"""
    url = f"{CLOB_API_URL}/book"
    params = {"token_id": market['id']}
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            book = response.json()
            anomalies = []
            
            # 检查买单 (Bids)
            for bid in book.get('bids', []):
                price = float(bid['price'])
                size = float(bid['size'])
                value = price * size
                if value > MIN_TRADE_SIZE:
                    anomalies.append({
                        "type": "Whale Bid (Buy Wall)",
                        "price": price,
                        "size": size,
                        "value": value,
                        "side": "YES" # 简化假设
                    })
            
            # 检查卖单 (Asks)
            for ask in book.get('asks', []):
                price = float(ask['price'])
                size = float(ask['size'])
                value = price * size
                if value > MIN_TRADE_SIZE:
                    anomalies.append({
                        "type": "Whale Ask (Sell Wall)",
                        "price": price,
                        "size": size,
                        "value": value,
                        "side": "YES" # 简化假设
                    })
            
            return anomalies
    except Exception as e:
        print(f"Error checking order book for {market['question']}: {e}")
    return []

def scan_markets():
    """扫描市场异动"""
    print(f"Scanning top markets for anomalies...")
    markets = get_top_markets()
    all_anomalies = []
    
    print(f"Found {len(markets)} markets to scan.")
    
    for market in markets:
        print(f"Checking: {market['question'][:30]}...")
        anomalies = check_whale_orders(market)
        
        for anomaly in anomalies:
            embed = {
                "title": f"🚨 {anomaly['type']} Detected!",
                "description": f"**Market:** [{market['question']}](https://polymarket.com/event/{market['slug']})\n**Value:** ${anomaly['value']:,.2f}\n**Price:** {anomaly['price']}\n**Size:** {anomaly['size']:,.0f}",
                "color": 16711680 if "Ask" in anomaly['type'] else 65280, # Red for Ask, Green for Bid
                "footer": {"text": "Polymarket Anomaly Monitor"},
                "timestamp": datetime.utcnow().isoformat()
            }
            all_anomalies.append(embed)
            
        # 避免 API 速率限制
        time.sleep(0.2)
        
    if all_anomalies:
        print(f"Found {len(all_anomalies)} anomalies. Sending alerts...")
        # 分批发送，避免 Discord 限制
        for i in range(0, len(all_anomalies), 10):
            batch = all_anomalies[i:i+10]
            send_discord_alert(batch)
    else:
        print("No anomalies found.")
        # 发送心跳包 (可选，每天发送一次或每次都发)
        # 这里设置为每次都发，以便用户确认脚本在运行
        heartbeat_embed = [{
            "title": "💓 Monitor Heartbeat",
            "description": f"Scanned {len(markets)} markets. No whale orders > ${MIN_TRADE_SIZE} detected.",
            "color": 3447003, # Blue
            "footer": {"text": "System is running normally"},
            "timestamp": datetime.utcnow().isoformat()
        }]
        send_discord_alert(heartbeat_embed)

if __name__ == "__main__":
    scan_markets()

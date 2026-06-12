package com.example.importtax.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.importtax.dao.HsCodeDao;
import com.example.importtax.entity.HsCode;
import com.example.importtax.response.OfficialHsCodeSyncRes;

@Service
public class HsCodeOfficialSyncService {

	private final HsCodeDao hsCodeDao;

	public HsCodeOfficialSyncService(HsCodeDao hsCodeDao) {
		this.hsCodeDao = hsCodeDao;
	}

	@Transactional
	public OfficialHsCodeSyncRes syncOfficialData() {

		List<OfficialHsCodeData> officialDataList = buildDemoOfficialData();

		int createdCount = 0;

		int updatedCount = 0;

		for (OfficialHsCodeData officialData : officialDataList) {

			Optional<HsCode> optionalHsCode = hsCodeDao.findByCode(officialData.code());

			HsCode hsCode;

			if (optionalHsCode.isPresent()) {
				hsCode = optionalHsCode.get();

				updatedCount++;
			} else {
				hsCode = new HsCode();

				hsCode.setCode(officialData.code());

				createdCount++;
			}

			hsCode.setName(officialData.name());

			hsCode.setCategoryName(officialData.categoryName());

			hsCode.setDutyRate(officialData.dutyRate());

			hsCode.setVatRate(BigDecimal.valueOf(5));

			hsCode.setDescription(officialData.description());

			hsCode.setKeywords(officialData.keywords());

			hsCodeDao.save(hsCode);
		}

		return new OfficialHsCodeSyncRes(officialDataList.size(), createdCount, updatedCount);
	}

	private List<OfficialHsCodeData> buildDemoOfficialData() {

		return List.of(
				new OfficialHsCodeData("0901.11.0000", "咖啡豆", "乾貨", BigDecimal.valueOf(5), "未焙炒咖啡，未除咖啡因",
						"咖啡|咖啡豆|未焙炒咖啡|日本咖啡|coffee|bean"),
				new OfficialHsCodeData("0901.21.0000", "焙炒咖啡豆", "乾貨", BigDecimal.valueOf(5), "已焙炒咖啡，未除咖啡因",
						"焙炒咖啡|咖啡豆|咖啡|coffee|roasted"),
				new OfficialHsCodeData("0406.10.0000", "起司", "冷藏", BigDecimal.valueOf(8), "新鮮起司，乳製品",
						"起司|乳酪|起士|cheese"),
				new OfficialHsCodeData("0306.17.0000", "冷凍蝦", "冷凍", BigDecimal.valueOf(8), "冷凍蝦，蝦類產品", "蝦|冷凍蝦|shrimp"),
				new OfficialHsCodeData("1902.30.0000", "即食麵", "乾貨", BigDecimal.valueOf(12), "即食麵，拉麵，泡麵，麵條",
						"拉麵|泡麵|即食麵|麵條|ramen|noodle"),
				new OfficialHsCodeData("1902.19.0000", "烏龍麵", "乾貨", BigDecimal.valueOf(12), "未調製麵條，烏龍麵，日本麵條",
						"烏龍麵|麵條|日本麵|udon|noodle"),
				new OfficialHsCodeData("1006.30.0000", "白米", "乾貨", BigDecimal.valueOf(8), "精米，白米，日本白米",
						"白米|米|日本米|rice"),
				new OfficialHsCodeData("1212.21.0000", "海苔", "乾貨", BigDecimal.valueOf(6), "食用海藻，海苔，乾燥海藻",
						"海苔|海藻|紫菜|nori|seaweed"),
				new OfficialHsCodeData("2103.10.0000", "醬油", "調味品", BigDecimal.valueOf(7), "醬油，調味醬料",
						"醬油|調味料|soy sauce"),
				new OfficialHsCodeData("2103.90.2000", "咖哩塊", "調味品", BigDecimal.valueOf(7), "咖哩塊，咖哩調味料，日式咖哩",
						"咖哩|咖哩塊|日式咖哩|curry"),
				new OfficialHsCodeData("0902.10.0000", "綠茶", "乾貨", BigDecimal.valueOf(6), "綠茶，茶葉，日本茶",
						"綠茶|茶葉|日本茶|green tea|tea"),
				new OfficialHsCodeData("0902.20.0000", "抹茶粉", "乾貨", BigDecimal.valueOf(6), "抹茶粉，綠茶粉，日本抹茶",
						"抹茶|抹茶粉|綠茶粉|matcha|green tea"),
				new OfficialHsCodeData("1905.31.0000", "餅乾", "乾貨", BigDecimal.valueOf(10), "甜餅乾，烘焙餅乾，包裝食品",
						"餅乾|甜餅乾|零食|biscuit|cookie"),
				new OfficialHsCodeData("1806.32.0000", "巧克力", "乾貨", BigDecimal.valueOf(10), "巧克力製品，塊狀巧克力，包裝食品",
						"巧克力|可可|chocolate|cocoa"),
				new OfficialHsCodeData("1704.90.0000", "糖果", "乾貨", BigDecimal.valueOf(10), "糖果，甜食，非巧克力糖果",
						"糖果|甜食|軟糖|candy|sweet"),
				new OfficialHsCodeData("0401.20.0000", "牛奶", "冷藏", BigDecimal.valueOf(8), "牛乳，鮮奶，乳製品",
						"牛奶|鮮奶|乳製品|milk"),
				new OfficialHsCodeData("0405.10.0000", "奶油", "冷藏", BigDecimal.valueOf(8), "奶油，乳脂製品", "奶油|乳脂|butter"),
				new OfficialHsCodeData("0403.10.0000", "優格", "冷藏", BigDecimal.valueOf(8), "優格，發酵乳製品",
						"優格|優酪乳|酸奶|yogurt"),
				new OfficialHsCodeData("0201.30.0000", "和牛", "肉品", BigDecimal.valueOf(15), "冷藏或冷凍牛肉，日本牛肉",
						"和牛|牛肉|日本牛肉|wagyu|beef"),
				new OfficialHsCodeData("0203.29.0000", "豬肉", "肉品", BigDecimal.valueOf(15), "冷凍豬肉，豬肉產品", "豬肉|冷凍豬肉|pork"),
				new OfficialHsCodeData("0207.14.0000", "雞肉", "肉品", BigDecimal.valueOf(15), "冷凍雞肉，禽肉產品",
						"雞肉|冷凍雞肉|chicken"),
				new OfficialHsCodeData("0302.14.0000", "鮭魚", "海鮮", BigDecimal.valueOf(10), "新鮮或冷藏鮭魚", "鮭魚|三文魚|salmon"),
				new OfficialHsCodeData("0303.89.0000", "冷凍魚", "冷凍", BigDecimal.valueOf(10), "冷凍魚類產品",
						"冷凍魚|魚|fish|frozen fish"),
				new OfficialHsCodeData("1604.20.0000", "柴魚片", "乾貨", BigDecimal.valueOf(10), "魚類調製品，柴魚片，調味用乾貨",
						"柴魚片|柴魚|鰹魚|bonito|katsuobushi"),
				new OfficialHsCodeData("1212.21.1000", "昆布", "乾貨", BigDecimal.valueOf(6), "食用海藻，昆布，乾燥海帶",
						"昆布|海帶|海藻|kombu|kelp"),
				new OfficialHsCodeData("0808.10.0000", "蘋果", "生鮮", BigDecimal.valueOf(5), "新鮮蘋果，水果", "蘋果|水果|apple"),
				new OfficialHsCodeData("0810.10.0000", "草莓", "生鮮", BigDecimal.valueOf(5), "新鮮草莓，水果",
						"草莓|水果|strawberry"),
				new OfficialHsCodeData("0702.00.0000", "番茄", "生鮮", BigDecimal.valueOf(3), "新鮮或冷藏番茄", "番茄|蕃茄|tomato"),
				new OfficialHsCodeData("2103.90.1000", "味醂風調味料", "調味品", BigDecimal.valueOf(7), "日式調味料，味醂風調味品，料理用調味液",
						"味醂|味霖|調味料|mirin|seasoning"),
				new OfficialHsCodeData("2103.90.3000", "味噌", "調味品", BigDecimal.valueOf(7), "味噌，日式發酵調味料",
						"味噌|味增|日式調味料|miso"),
				new OfficialHsCodeData("2103.20.0000", "番茄醬", "調味品", BigDecimal.valueOf(7), "番茄醬，調味醬料",
						"番茄醬|蕃茄醬|ketchup|tomato sauce"),
				new OfficialHsCodeData("2104.10.0000", "湯包", "加工食品", BigDecimal.valueOf(10), "湯品調製品，速食湯包",
						"湯包|味噌湯|即食湯|soup"),
				new OfficialHsCodeData("2005.99.0000", "泡菜", "加工食品", BigDecimal.valueOf(10), "調製蔬菜，醃漬蔬菜",
						"泡菜|醃菜|漬物|kimchi|pickles"),
				new OfficialHsCodeData("2008.19.0000", "堅果", "乾貨", BigDecimal.valueOf(10), "調製堅果，包裝堅果食品",
						"堅果|杏仁|腰果|nuts|almond"));

	}

	private record OfficialHsCodeData(String code, String name, String categoryName, BigDecimal dutyRate,
			String description, String keywords) {
	}
}
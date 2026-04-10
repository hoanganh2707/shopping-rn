import React, { useEffect, useState } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';
import { BarChart, PieChart } from 'react-native-chart-kit';

import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { chartApi } from '~/apis';
import { Header, Text } from '~/components';
import { SCREEN_WIDTH } from '~/constants';

const Tab = createMaterialTopTabNavigator();

export const Chart = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [dataPieChart, setDataPieChart] = useState([]);

  const getFirstAndLastDaysOfMonthInYear = () => {
    const year = moment().year();
    const result = [];
    for (let month = 0; month < 12; month++) {
      const firstDay = Timestamp.fromDate(
        new Date(moment([year, month]).startOf('month')),
      );
      const lastDay = Timestamp.fromDate(
        new Date(moment([year, month]).endOf('month')),
      );
      result.push({ firstDay, lastDay });
    }
    return result;
  };

  const firstAndLastDaysOfMonth = getFirstAndLastDaysOfMonthInYear();

  const calculateTotalByProductId = (orders) => {
    const productTotals = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.id;
        const quantity = item.quantity;
        const price = item.price;
        const name = item.product.name;
        if (!productTotals[productId]) {
          productTotals[productId] = {
            population: 0,
            name,
            color: getRandomColor(),
          };
        }

        productTotals[productId].population += price * quantity;
      });
    });
    return Object.values(productTotals);
  };

  const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getDataPieChart = async () => {
    const first = Timestamp.fromDate(new Date(moment().startOf('year')));
    const last = Timestamp.fromDate(new Date(moment().endOf('year')));
    const res = await chartApi.getListOrderByDateRange(first, last);

    const data = calculateTotalByProductId(res?.data);
    setDataPieChart(data);
  };

  const getDataBarChart = async () => {
    const promises = firstAndLastDaysOfMonth.map((element) =>
      chartApi.getListOrderByDateRange(element.firstDay, element.lastDay),
    );
    const data = await Promise.all(promises);

    const arr = [];
    data.forEach((element) => {
      if (element?.data?.length !== 0) {
        const total = element?.data?.reduce(
          (accumulator, currentValue) => accumulator + currentValue.totalAmount,
          0,
        );
        arr.push(total / 1000000);
      } else {
        arr.push(0);
      }
    });
    setData(arr);
  };

  useEffect(() => {
    getDataBarChart();
    getDataPieChart();
  }, []);

  const dataChart = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    datasets: [
      {
        data: data,
      },
    ],
  };

  const renderBarChart = () => {
    return (
      <ScrollView showsHorizontalScrollIndicator={false} horizontal>
        {data.length !== 0 && (
          <BarChart
            data={dataChart}
            width={SCREEN_WIDTH * 2}
            height={SCREEN_WIDTH}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
          />
        )}
      </ScrollView>
    );
  };

  const renderPieChart = () => {
    return (
      <ScrollView showsHorizontalScrollIndicator={false} horizontal>
        <PieChart
          data={dataPieChart}
          width={SCREEN_WIDTH}
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={-10}
          absolute
        />
      </ScrollView>
    );
  };

  return (
    <>
      <Header />
      <ScrollView>
        <Text style={styles.text}>
          {t('chartScreen.revenueChartByProduct')}
        </Text>
        {renderPieChart()}
        <Text style={styles.text}>{t('chartScreen.revenueChartByMonth')}</Text>
        {renderBarChart()}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    marginVertical: 12,
  },
});

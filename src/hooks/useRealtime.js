import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { db } from '~/config';
import { COLLECTIONS } from '~/constants';
import { selectUser } from '~/redux';

/**
 * Lấy danh sách Danh Mục theo thời gian thực
 */
export const useGetListCategoryRealtime = () => {
  const [data, setData] = useState();

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      orderBy('createdAt'),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newDocuments = querySnapshot.docs.map((doc) => doc.data());
      setData(newDocuments);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};

/**
 * Lấy danh sách Sản Phẩm theo thời gian thực
 */
export const useGetListProductRealtime = () => {
  const [data, setData] = useState();

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const products = querySnapshot.docs.map((doc) => doc.data());

      // Get an array of unique user IDs from all products
      const categoryIds = [
        ...new Set(
          products.map((product) => product.category._key.path.segments.at(-1)),
        ),
      ];

      // Fetch documents of those categories only
      const categoryPromises = categoryIds.map((categoryId) =>
        getDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId)),
      );

      const categoryDocs = await Promise.all(categoryPromises);

      // Record<string, CategoryDocumentData>
      const categories = categoryDocs.reduce((accumulator, currentDoc) => {
        accumulator[currentDoc.id] = currentDoc.data();
        return accumulator;
      }, {});

      const newData = products.map((product) => {
        const categoryKey = product.category._key.path.segments.at(-1);
        return { ...product, category: categories[categoryKey] };
      });

      setData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};

/**
 * Lấy danh sách Đơn Hàng của 1 User với User Id
 */
export const useGetListOrderByUserIdRealtime = () => {
  const [data, setData] = useState();
  const user = useSelector(selectUser);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy('createdAt'),
      where('uid', '==', user.uid),
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => doc.data());
      const productIds = [];
      documents?.forEach((element) => {
        element?.items?.forEach((item) => {
          if (!productIds.find((e) => e === item.id)) {
            productIds.push(item.id);
          }
        });
      });

      const productPromises = productIds.map((productId) =>
        getDoc(doc(db, COLLECTIONS.PRODUCTS, productId)),
      );

      const productDocs = await Promise.all(productPromises);

      const products = productDocs.reduce((accumulator, currentDoc) => {
        accumulator[currentDoc.id] = currentDoc.data();
        return accumulator;
      }, {});

      const newData = documents.map((element) => {
        const items = element.items.map((item) => {
          return {
            ...item,
            product: products[item.id],
          };
        });
        return { ...element, items: items };
      });

      setData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};

/**
 * Lấy danh sách Đánh Giá theo thời gian thực
 */
export const useGetListRatingRealtime = () => {
  const [data, setData] = useState();

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.RATINGS),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const ratings = querySnapshot.docs.map((doc) => doc.data());

      const userIds = [...new Set(ratings.map((element) => element.uid))];

      const userIdPromises = userIds.map((uid) =>
        getDoc(doc(db, COLLECTIONS.USERS, uid)),
      );

      const userDocs = await Promise.all(userIdPromises);

      const users = userDocs.reduce((accumulator, currentDoc) => {
        accumulator[currentDoc.id] = currentDoc.data();
        return accumulator;
      }, {});

      const newData = ratings?.map((rating) => {
        return { ...rating, user: users[rating.uid] };
      });

      setData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};

/**
 * Lấy danh sách Bình Luận theo thời gian thực
 */
export const useGetListCommentRealtime = () => {
  const [data, setData] = useState();

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.COMMENTS), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const comments = querySnapshot.docs.map((doc) => doc.data());

      const userIds = [...new Set(comments.map((element) => element.uid))];

      const userIdPromises = userIds.map((uid) =>
        getDoc(doc(db, COLLECTIONS.USERS, uid)),
      );

      const userDocs = await Promise.all(userIdPromises);

      const users = userDocs.reduce((accumulator, currentDoc) => {
        accumulator[currentDoc.id] = currentDoc.data();
        return accumulator;
      }, {});

      const newData = comments?.map((comment) => {
        return { ...comment, user: users[comment.uid] };
      });

      setData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};

/**
 * Lấy danh sách Đơn Hàng theo thời gian thực
 */
export const useGetListOrderRealtime = () => {
  const [data, setData] = useState();

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => doc.data());
      const productIds = [];
      documents?.forEach((element) => {
        element?.items?.forEach((item) => {
          if (!productIds.find((e) => e === item.id)) {
            productIds.push(item.id);
          }
        });
      });

      const productPromises = productIds.map((productId) =>
        getDoc(doc(db, COLLECTIONS.PRODUCTS, productId)),
      );

      const productDocs = await Promise.all(productPromises);

      const products = productDocs.reduce((accumulator, currentDoc) => {
        accumulator[currentDoc.id] = currentDoc.data();
        return accumulator;
      }, {});

      const newData = documents.map((element) => {
        const items = element.items.map((item) => {
          return {
            ...item,
            product: products[item.id],
          };
        });
        return { ...element, items: items };
      });

      setData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return data;
};

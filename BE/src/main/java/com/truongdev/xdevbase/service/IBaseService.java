package com.truongdev.xdevbase.service;

import com.truongdev.xdevbase.entity.BaseEntity;
import java.util.List;

public interface IBaseService <E extends BaseEntity>{
  E create(Long cid, String uid, E e);

  E update(Long cid, String uid, E e , Long id);

  void delete(Long cid, String uid, Long id);

  void changeStatus(Long cid, String uid, Long id);

  List<E> getAll(Long cid, String uid);

}

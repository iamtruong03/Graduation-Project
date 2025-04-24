package com.dev.truongdev.xdevbase.service;

import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import java.util.List;

public interface IXDevBaseService <E extends XDevBaseEntity>{
  E create(String uid, E e);

  E update(String uid, E e , Long id);

  void delete(String uid, Long id);

  void changeStatus(String uid, Long id);

  E getById(String uid, Long id);

  List<E> getAll(String uid);

}
